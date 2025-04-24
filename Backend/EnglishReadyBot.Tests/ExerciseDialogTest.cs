using System.Linq;
using System.Threading.Tasks;
using EnglishReadyBot.Dialogs.Operations;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Adapters;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Testing;
using Microsoft.Bot.Schema;
using Xunit;

namespace EnglishReadyBot.Tests
{
    public class ExerciseDialogTests
    {
        private readonly TestAdapter _adapter;
        private readonly ConversationState _conversationState;
        private readonly DialogSet _dialogs;

        public ExerciseDialogTests()
        {
            _conversationState = new ConversationState(new MemoryStorage());
            _adapter = new TestAdapter(TestAdapter.CreateConversation("ExerciseDialogTests"))
                .Use(new AutoSaveStateMiddleware(_conversationState));

            var dialogState = _conversationState.CreateProperty<DialogState>("DialogState");
            _dialogs = new DialogSet(dialogState);
            _dialogs.Add(new ExerciseDialog());
        }

        [Fact]
        public async Task DisplayTask_SendsAdaptiveCardThenPrompt()
        {
            await new TestFlow(_adapter, async (turnContext, cancellationToken) =>
            {
                var dialogContext = await _dialogs.CreateContextAsync(turnContext, cancellationToken);
                var results = await dialogContext.ContinueDialogAsync(cancellationToken);
                if (results.Status == DialogTurnStatus.Empty)
                {
                    await dialogContext.BeginDialogAsync(nameof(ExerciseDialog), null, cancellationToken);
                }
            })
            .Send("start")
            .AssertReply(activity =>
            {
                var msg = activity.AsMessageActivity();
                Assert.NotNull(msg);
                Assert.NotNull(msg.Attachments);
                Assert.True(msg.Attachments.Count > 0);
                Assert.Contains("adaptive", msg.Attachments[0].ContentType);
                
            })
            .AssertReply(activity =>
            {
                var msg = activity.AsMessageActivity();
                Assert.NotNull(msg);
                Assert.Contains("Which section would you like to write?", msg.Text);
                          })
            .StartTestAsync();
        }

    }
}