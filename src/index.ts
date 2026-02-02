import { renderHtml } from "./renderHtml";

interface TelegramUpdate {
	update_id: number;
	message?: {
		message_id: number;
		from: {
			id: number;
			is_bot: boolean;
			first_name: string;
			username?: string;
		};
		chat: {
			id: number;
			title?: string;
			type: string;
		};
		date: number;
		text?: string;
	};
}

async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
	const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			chat_id: chatId,
			text: text,
			parse_mode: 'HTML',
		}),
	});
	
	if (!response.ok) {
		const errorData = await response.json();
		console.error('Telegram API error:', errorData);
		throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
	}
	
	return response.json();
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// Handle Telegram webhook
		if (request.method === 'POST' && url.pathname === '/webhook') {
			try {
				const body = await request.text();
				const update: TelegramUpdate = JSON.parse(body);

				// Check if we have a message
				if (update.message && update.message.chat) {
					const chatId = update.message.chat.id;
					const botToken = env.TELEGRAM_BOT_TOKEN;

					if (!botToken) {
						return new Response('Bot token not configured', { status: 500 });
					}

					// Sanitize and format the message to echo back
					const receivedText = update.message.text || '(no text)';
					
					// Create a sanitized version of the request body (reuse parsed update)
					const sanitizedBody = {
						update_id: update.update_id,
						message: {
							message_id: update.message.message_id,
							from: {
								first_name: update.message.from.first_name,
								username: update.message.from.username,
								is_bot: update.message.from.is_bot,
							},
							chat: {
								id: update.message.chat.id,
								type: update.message.chat.type,
								title: update.message.chat.title,
							},
							date: update.message.date,
							text: update.message.text,
						},
					};
					
					const sanitizedBodyStr = JSON.stringify(sanitizedBody, null, 2);
					
					// Escape HTML special characters for safe display
					const escapeHtml = (text: string) => 
						text.replace(/&/g, '&amp;')
							.replace(/</g, '&lt;')
							.replace(/>/g, '&gt;')
							.replace(/"/g, '&quot;')
							.replace(/'/g, '&#x27;');
					
					// Format with HTML
					const echoMessage = 
						`<b>Received message:</b>\n\n${escapeHtml(receivedText)}\n\n` +
						`<b>───────────────</b>\n\n` +
						`<b>Full request body:</b>\n<pre>${escapeHtml(sanitizedBodyStr)}</pre>`;

					// Send the message back to the chat
					await sendTelegramMessage(botToken, chatId, echoMessage);
				}

				return new Response('OK', { status: 200 });
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				console.error('Error processing webhook:', {
					error: errorMessage,
					stack: error instanceof Error ? error.stack : undefined,
					type: error instanceof SyntaxError ? 'JSON parsing error' : 'Unknown error type',
				});
				
				// Return appropriate error response
				if (error instanceof SyntaxError) {
					return new Response('Invalid JSON payload', { status: 400 });
				}
				
				return new Response(`Error processing webhook: ${errorMessage}`, { status: 500 });
			}
		}

		// Default handler - show D1 database content
		const stmt = env.DB.prepare("SELECT * FROM comments LIMIT 3");
		const { results } = await stmt.all();

		return new Response(renderHtml(JSON.stringify(results, null, 2)), {
			headers: {
				"content-type": "text/html",
			},
		});
	},
} satisfies ExportedHandler<Env>;
