import { REST } from "@discordjs/rest";
import { Routes, APIEmbed } from "discord-api-types/v10";

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_BOT_TOKEN!
);

export async function postLeadEmbed(embed: APIEmbed): Promise<void> {
  const channelId = process.env.DISCORD_CHANNEL_ID!;
  await rest.post(Routes.channelMessages(channelId), {
    body: { embeds: [embed] },
  });
}

export function buildLeadEmbed(lead: ParsedLead): APIEmbed {
  const fields = [
    lead.email && { name: "Email", value: lead.email, inline: true },
    lead.phone && { name: "Phone", value: lead.phone, inline: true },
    lead.businessName && {
      name: "Business Name",
      value: lead.businessName,
      inline: false,
    },
    lead.monthlyRevenue && {
      name: "Monthly Revenue",
      value: lead.monthlyRevenue,
      inline: true,
    },
    lead.loanAmount && {
      name: "Requested Amount",
      value: lead.loanAmount,
      inline: true,
    },
    lead.timeInBusiness && {
      name: "Time in Business",
      value: lead.timeInBusiness,
      inline: true,
    },
    lead.source && { name: "Lead Source", value: lead.source, inline: true },
    lead.pipeline && { name: "Pipeline", value: lead.pipeline, inline: true },
    lead.stage && { name: "Stage", value: lead.stage, inline: true },
    lead.tags.length > 0 && {
      name: "Tags",
      value: lead.tags.join(", "),
      inline: false,
    },
  ].filter(Boolean) as APIEmbed["fields"];

  return {
    title: `New Revenue-Based Lending Lead`,
    description: `**${lead.fullName}** submitted a new inquiry`,
    color: 0x2ecc71,
    fields,
    footer: {
      text: `GoHighLevel • Lead ID: ${lead.id}`,
    },
    timestamp: new Date().toISOString(),
  };
}

export interface ParsedLead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  monthlyRevenue: string;
  loanAmount: string;
  timeInBusiness: string;
  source: string;
  pipeline: string;
  stage: string;
  tags: string[];
}
