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
		}),
	});
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

					// Format the message to echo back
					const echoMessage = `Received message:\n\n${update.message.text || '(no text)'}\n\n---\n\nFull request body:\n\`\`\`json\n${body}\n\`\`\``;

					// Send the message back to the chat
					await sendTelegramMessage(botToken, chatId, echoMessage);
				}

				return new Response('OK', { status: 200 });
			} catch (error) {
				console.error('Error processing webhook:', error);
				return new Response('Error processing webhook', { status: 500 });
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
