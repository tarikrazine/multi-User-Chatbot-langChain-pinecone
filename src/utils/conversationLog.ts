import { SupabaseClient } from "@supabase/supabase-js";

class ConversationLog {
  constructor(
    public supabase: SupabaseClient,
  ) {
    this.supabase = supabase;
  }

  public async addEntry(
    { entry, speaker, userId }: {
      entry: string;
      speaker: string;
      userId: string;
    },
  ) {
    const { error } = await this.supabase.from("conversations").insert({
      entry,
      speaker,
      user_id: userId,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  public async getConversation(
    { limit }: { limit: number },
  ): Promise<string[] | String | void> {
    const { data: history, error } = await this.supabase.from(
      "conversations",
    )
      .select("*")
      .limit(
        limit,
      );

    if (error) {
      throw new Error(error.message);
    }

    if (history) {
      return history.map((entry) => {
        return `${entry.speaker.toUpperCase()}: ${entry.entry}`;
      }).reverse();
    }

    console.log("No conversation history");
  }

  public async clearConversation(userId: string) {
    await this.supabase.from("conversations").delete().eq(
      "user_id",
      userId,
    );
  }
}

export { ConversationLog };
