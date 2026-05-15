import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import "dotenv/config";

const TOKEN = process.env.DISCORD_BOT_TOKEN!;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID!;

const commands = [
  new SlashCommandBuilder()
    .setName("leads")
    .setDescription("Revenue-based lending lead commands")
    .addSubcommand((sub) =>
      sub.setName("status").setDescription("Check bot and webhook status")
    )
    .addSubcommand((sub) =>
      sub
        .setName("test")
        .setDescription("Post a test lead notification to the configured channel")
    ),
];

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  console.log("Registering slash commands...");
  await rest.put(Routes.applicationCommands(CLIENT_ID), {
    body: commands.map((c) => c.toJSON()),
  });
  console.log("Slash commands registered.");
}

async function handleLeadsStatus(interaction: ChatInputCommandInteraction) {
  const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/webhooks/gohighlevel`;
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle("RBL Lead Bot — Status")
        .setColor(0x2ecc71)
        .addFields(
          { name: "Webhook Endpoint", value: `\`${webhookUrl}\``, inline: false },
          {
            name: "Notification Channel",
            value: `<#${CHANNEL_ID}>`,
            inline: true,
          },
          { name: "Status", value: "Online", inline: true }
        )
        .setTimestamp(),
    ],
    ephemeral: true,
  });
}

async function handleLeadsTest(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const testEmbed = new EmbedBuilder()
    .setTitle("New Revenue-Based Lending Lead")
    .setDescription("**John Smith** submitted a new inquiry")
    .setColor(0x2ecc71)
    .addFields(
      { name: "Email", value: "john@smithbiz.com", inline: true },
      { name: "Phone", value: "(555) 123-4567", inline: true },
      { name: "Business Name", value: "Smith LLC", inline: false },
      { name: "Monthly Revenue", value: "$45,000", inline: true },
      { name: "Requested Amount", value: "$75,000", inline: true },
      { name: "Time in Business", value: "3 years", inline: true },
      { name: "Lead Source", value: "Website Form", inline: true },
      { name: "Pipeline", value: "Revenue Based Lending", inline: true },
      { name: "Tags", value: "rbl, new-lead, website", inline: false }
    )
    .setFooter({ text: "GoHighLevel • Lead ID: test-001" })
    .setTimestamp();

  const channel = await interaction.client.channels.fetch(CHANNEL_ID);
  if (!channel?.isTextBased()) {
    await interaction.editReply("Could not find the configured channel.");
    return;
  }

  await (channel as import("discord.js").TextChannel).send({ embeds: [testEmbed] });
  await interaction.editReply(`Test lead posted to <#${CHANNEL_ID}>.`);
}

async function main() {
  await registerCommands();

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "leads") return;

    const sub = interaction.options.getSubcommand();
    if (sub === "status") await handleLeadsStatus(interaction);
    if (sub === "test") await handleLeadsTest(interaction);
  });

  await client.login(TOKEN);
}

main().catch(console.error);
