using EnglishReadyBot.Dialogs.SubDialogs;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EnglishReadyBot.Dialogs.Operations
{
    public class GrammarDialog: ComponentDialog
    {
        public GrammarDialog() : base(nameof(GrammarDialog))
        {
            var waterfullSteps = new WaterfallStep[]
            {
                GrammarStepAsync,
                ActStepAsync,
                MoreGrammarStepAsync,
                SummaryStepAsync
            };

            AddDialog(new WaterfallDialog(nameof(WaterfallDialog), waterfullSteps));
            AddDialog(new TextPrompt(nameof(TextPrompt)));
            AddDialog(new ConfirmPrompt(nameof(ConfirmPrompt)));

            InitialDialogId = nameof(WaterfallDialog);
        }

        private async Task<DialogTurnResult> SummaryStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            var userDetails = (User)stepContext.Result;
            await stepContext.Context.SendActivityAsync(MessageFactory.Text("Returning the grammar & grammar corrections"), cancellationToken);
            for (int i = 0; i < userDetails.GrammarCorrections.Count; i++)
            {
                await stepContext.Context.SendActivityAsync(MessageFactory.Text(userDetails.GrammarCorrections[i]), cancellationToken);
            }
            return await stepContext.EndDialogAsync(userDetails,cancellationToken);
        }

        private async Task<DialogTurnResult> GrammarStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            return await stepContext.PromptAsync(nameof(TextPrompt), new PromptOptions
            {
                Prompt = MessageFactory.Text("Give me something to check the grammar?")
            }, cancellationToken);
            
        }

        private async Task<DialogTurnResult> ActStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            var userDetails = (User)stepContext.Options;
            stepContext.Values["Grammar"] = (string)stepContext.Result;
            userDetails.GrammarCorrections.Add((string)stepContext.Values["Grammar"]);

            return await stepContext.PromptAsync(nameof(TextPrompt), new PromptOptions
            {
                Prompt = MessageFactory.Text("Anything else to grammar check?")
            }, cancellationToken);
        }

        private async Task<DialogTurnResult> MoreGrammarStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            var userDetails = (User)stepContext.Options;
            if ((bool)stepContext.Result)
            {
                return await stepContext.BeginDialogAsync(nameof(CreateMoreGrammarDialog), userDetails, cancellationToken);
            }
            else
            {
                return await stepContext.NextAsync(userDetails, cancellationToken);
            }
        }
    }
}
