require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField, ChannelType } = require('discord.js');

// Configuración de límites anti-spam
const MESSAGE_LIMIT = 3; // Número máximo de mensajes permitidos
const TIME_LIMIT = 10 * 1000; // Ventana de tiempo en milisegundos (10 segundos)
const MUTE_TIME = 5 * 60 * 1000; // Tiempo de muteo en milisegundos (5 minutos)

// Ejecutar el script de registro de comandos
exec("node registerCommands.js", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing registerCommands.js: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection()
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"))

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

const userMessageCounts = new Map(); // Rastrea mensajes por usuario

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return; // Ignorar mensajes de bots

  // Revisar si el mensaje es "patata" o variaciones
  if (msg.content.toLowerCase() === 'patata') {
    const userId = msg.author.id;
    const now = Date.now();

    // Inicializar registro para el usuario si no existe
    if (!userMessageCounts.has(userId)) {
      userMessageCounts.set(userId, []);
    }

    const timestamps = userMessageCounts.get(userId);

    // Agregar timestamp actual y filtrar mensajes fuera del tiempo límite
    timestamps.push(now);
    const recentTimestamps = timestamps.filter((time) => now - time <= TIME_LIMIT);
    userMessageCounts.set(userId, recentTimestamps);

    // Si exceden el límite, eliminar mensajes y poner al usuario en timeout
    if (recentTimestamps.length > MESSAGE_LIMIT) {
      try {
        // Buscar y eliminar los últimos 3 mensajes del usuario
        const fetchedMessages = await msg.channel.messages.fetch({ limit: 10 });
        const userMessages = fetchedMessages.filter(m => m.author.id === userId).first(3);

        for (const message of userMessages) {
          await message.delete();
        }

        // Poner al usuario en timeout (silencio temporal)
        await msg.member.timeout(MUTE_TIME, 'Exceso de patatas');

        // Enviar un mensaje de advertencia al canal
        msg.channel.send(`<@${userId}> has sido muteado y sus últimos 3 mensajes han sido eliminados por abuso de "patata".`);

        // Limpiar el contador de mensajes del usuario
        userMessageCounts.delete(userId);
      } catch (error) {
        console.error('Error al poner al usuario en timeout o eliminar mensajes:', error);
      }
    } else {
      // Enviar un sticker de "patata" si no es abuso
      try {
        await msg.channel.send({
          stickers: ['1212854749469220875'] // Reemplaza con el ID del sticker
        });
      } catch (error) {
        console.error('Error al enviar el sticker:', error);
      }
    }
  }
});

client.login(process.env.TOKEN); // Iniciar el bot
