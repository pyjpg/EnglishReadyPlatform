using AdaptiveCards;
using Microsoft.Bot.Builder.Dialogs.Choices;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.Extensions.Logging;
using System.Linq;
using Microsoft.Bot.Schema;
using System;
using EnglishReadyBot.Dialogs.Operations;

namespace EnglishReadyBot.Dialogs
{
    public class OptionsDialog : ComponentDialog
    {
      
        public OptionsDialog() : base(nameof(OptionsDialog))
        {
           
            AddDialog(new TextPrompt(nameof(TextPrompt)));
            AddDialog(new ChoicePrompt(nameof(ChoicePrompt)));

            var waterfallSteps = new WaterfallStep[]
            {
                OptionsStepAsync,
                HandleUserInputAsync,
            };

            AddDialog(new WaterfallDialog(nameof(WaterfallDialog), waterfallSteps));
            AddDialog(new GrammarDialog());
            AddDialog(new WritingDialog());
            AddDialog(new ExerciseDialog());

            // The initial child Dialog to run.
            InitialDialogId = nameof(WaterfallDialog);
        }

        private async Task<DialogTurnResult> HandleUserInputAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            var operation = (stepContext.Result as FoundChoice)?.Value;

            if (string.IsNullOrEmpty(operation))
            {
                await stepContext.Context.SendActivityAsync(MessageFactory.Text("Invalid operation selected."), cancellationToken);
                return await stepContext.EndDialogAsync(null, cancellationToken);
            }

            switch (operation)
            {
                case "Writing Exercise":
                    return await stepContext.BeginDialogAsync(nameof(ExerciseDialog), null, cancellationToken);
                case "Grammar Correction":
                    return await stepContext.BeginDialogAsync(nameof(GrammarDialog), null, cancellationToken);
                case "Writing Tips":
                    return await stepContext.BeginDialogAsync(nameof(WritingDialog), null, cancellationToken);
            }
            return await stepContext.NextAsync(null, cancellationToken);
        }

        private async Task<DialogTurnResult> OptionsStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
            {
                await stepContext.Context.SendActivityAsync(
                    MessageFactory.Text("What task you would like to me to perform?"), cancellationToken);

                List<string> operationList = new List<string> { "Grammar Correction", "Writing Tips", "Writing Exercise" };
                // Create card
                var card = new AdaptiveCard(new AdaptiveSchemaVersion(1, 0))
                {
                    // Use LINQ to turn the choices into submit actions
                    Actions = operationList.Select(choice => new AdaptiveSubmitAction
                    {
                        Title = choice,
                        Data = choice,  // This will be a string
                    }).ToList<AdaptiveAction>(),
                };
                // Prompt
                return await stepContext.PromptAsync(nameof(ChoicePrompt), new PromptOptions
                {
                    Prompt = (Activity)MessageFactory.Attachment(new Attachment
                    {
                        ContentType = AdaptiveCard.ContentType,
                        // Convert the AdaptiveCard to a JObject
                        Content = JObject.FromObject(card),
                    }),
                    Choices = ChoiceFactory.ToChoices(operationList),
                    // Don't render the choices outside the card
                    Style = ListStyle.None,
                },
                    cancellationToken);
            }
        }
    }


