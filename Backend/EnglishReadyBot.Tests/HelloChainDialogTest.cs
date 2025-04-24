using EnglishReadyBot.Dialogs;
using EnglishReadyBot.Dialogs.Operations;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Adapters;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Schema;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

    namespace EnglishReadyBot.Tests
    {
        public class HelloChainDialogTest
        {
            private readonly TestAdapter _adapter;
            private readonly ConversationState _conversationState;
            private readonly DialogSet _dialogs;

            public HelloChainDialogTest()
            {
                _conversationState = new ConversationState(new MemoryStorage());
                _adapter = new TestAdapter(TestAdapter.CreateConversation("HelloChainDialogTests"))
                    .Use(new AutoSaveStateMiddleware(_conversationState));

                var dialogState = _conversationState.CreateProperty<DialogState>("DialogState");
                _dialogs = new DialogSet(dialogState);
                _dialogs.Add(new HelloChainDialog());
            }

            [Fact]
            public async Task ShouldPromptForGreeting()
            {
                await new TestFlow(_adapter, async (turnContext, cancellationToken) =>
                {
                    var dialogContext = await _dialogs.CreateContextAsync(turnContext, cancellationToken);
                    var results = await dialogContext.ContinueDialogAsync(cancellationToken);

                    if (results.Status == DialogTurnStatus.Empty)
                    {
                        await dialogContext.BeginDialogAsync(nameof(HelloChainDialog), null, cancellationToken);
                    }
                })
                .Send("start")
                .AssertReply("Say something!")
                .StartTestAsync();
            }

            [Fact]
            public async Task ShouldRespondToHi()
            {
                await new TestFlow(_adapter, async (turnContext, cancellationToken) =>
                {
                    var dialogContext = await _dialogs.CreateContextAsync(turnContext, cancellationToken);
                    var results = await dialogContext.ContinueDialogAsync(cancellationToken);

                    if (results.Status == DialogTurnStatus.Empty)
                    {
                        await dialogContext.BeginDialogAsync(nameof(HelloChainDialog), null, cancellationToken);
                    }
                })
                .Send("start")
                .AssertReply("Say something!")
                .Send("hi")
                .AssertReply("You said Hi!")
                .StartTestAsync();
            }

            [Fact]
            public async Task ShouldRespondToOtherInput()
            {
                await new TestFlow(_adapter, async (turnContext, cancellationToken) =>
                {
                    var dialogContext = await _dialogs.CreateContextAsync(turnContext, cancellationToken);
                    var results = await dialogContext.ContinueDialogAsync(cancellationToken);

                    if (results.Status == DialogTurnStatus.Empty)
                    {
                        await dialogContext.BeginDialogAsync(nameof(HelloChainDialog), null, cancellationToken);
                    }
                })
                .Send("start")
                .AssertReply("Say something!")
                .Send("test")
                .AssertReply("You said something else: 'test'")
                .StartTestAsync();
            }
        }

   

           }
