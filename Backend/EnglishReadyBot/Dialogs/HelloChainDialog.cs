using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Schema;
using System.Threading;
using System.Threading.Tasks;

namespace EnglishReadyBot.Dialogs
{
    public class HelloChainDialog : ComponentDialog
    {
        public HelloChainDialog() : base(nameof(HelloChainDialog))
        {
            var waterfallSteps = new WaterfallStep[]
            {
                AskForGreetingStepAsync,
                ProcessGreetingStepAsync
            };

            // Add the waterfall dialog to the dialog set.
            AddDialog(new WaterfallDialog(nameof(WaterfallDialog), waterfallSteps));
            AddDialog(new TextPrompt(nameof(TextPrompt))); // For text input

            // Set the starting dialog.
            InitialDialogId = nameof(WaterfallDialog);
        }

        private async Task<DialogTurnResult> AskForGreetingStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            // Ask the user for input
            return await stepContext.PromptAsync(nameof(TextPrompt), new PromptOptions { Prompt = MessageFactory.Text("Say something!") }, cancellationToken);
        }

        private async Task<DialogTurnResult> ProcessGreetingStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            // Get the user's input
            var userInput = (string)stepContext.Result;

            // Handle greeting or default response
            if (userInput.ToLower().Contains("hi") || userInput.ToLower().Contains("hello"))
            {
                await stepContext.Context.SendActivityAsync(MessageFactory.Text("You said Hi!"), cancellationToken);
            }
            else
            {
                await stepContext.Context.SendActivityAsync(MessageFactory.Text($"You said something else: '{userInput}'"), cancellationToken);
            }

            // End the dialog
            return await stepContext.EndDialogAsync(cancellationToken: cancellationToken);
        }
    }
}
