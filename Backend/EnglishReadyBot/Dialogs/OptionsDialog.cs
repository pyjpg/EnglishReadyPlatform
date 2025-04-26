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
            AddDialog(new ConfirmPrompt(nameof(ConfirmPrompt)));

            AddDialog(new ExerciseDialog());

            var waterfallSteps = new WaterfallStep[]
            {
                IntroStepAsync,
                ConfirmExerciseAsync,
                ProcessConfirmationAsync,
                FinalStepAsync
            };

            AddDialog(new WaterfallDialog(nameof(WaterfallDialog), waterfallSteps));

            // The initial child Dialog to run.
            InitialDialogId = nameof(WaterfallDialog);
        }

        private async Task<DialogTurnResult> IntroStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            // Provide a welcoming message that introduces the writing exercise
            string welcomeMessage = stepContext.Options?.ToString() ??
                "Welcome! I can help you improve your writing skills with a specialized writing exercise.";

            await stepContext.Context.SendActivityAsync(MessageFactory.Text(welcomeMessage), cancellationToken);

            // Directly ask if they want to proceed with the writing exercise
            return await stepContext.PromptAsync(nameof(ConfirmPrompt), new PromptOptions
            {
                Prompt = MessageFactory.Text("Would you like to try our writing exercise?"),
            }, cancellationToken);
        }

        private async Task<DialogTurnResult> ConfirmExerciseAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            // Get the user's response
            bool wantsToDoExercise = (bool)stepContext.Result;

            // Store the result for the next step
            stepContext.Values["doExercise"] = wantsToDoExercise;

            return await stepContext.NextAsync(null, cancellationToken);
        }

        private async Task<DialogTurnResult> ProcessConfirmationAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            bool doExercise = (bool)stepContext.Values["doExercise"];

            if (doExercise)
            {
                // User wants to do the exercise, so start that dialog
                return await stepContext.BeginDialogAsync(nameof(ExerciseDialog), null, cancellationToken);
            }
            else
            {
                // User doesn't want to do the exercise
                await stepContext.Context.SendActivityAsync(
                    MessageFactory.Text("No problem! You can always come back when you're ready to try the writing exercise."),
                    cancellationToken);

                // No other options, so ask if they want to reconsider
                return await stepContext.PromptAsync(nameof(ConfirmPrompt), new PromptOptions
                {
                    Prompt = MessageFactory.Text("Would you like to reconsider and try the writing exercise now?"),
                }, cancellationToken);
            }
        }

        private async Task<DialogTurnResult> FinalStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            // Check if this is coming from the reconsideration prompt
            if (stepContext.Result is bool reconsiderResult)
            {
                if (reconsiderResult)
                {
                    // User changed their mind and now wants to do the exercise
                    return await stepContext.BeginDialogAsync(nameof(ExerciseDialog), null, cancellationToken);
                }
                else
                {
                    // User still doesn't want to do the exercise
                    await stepContext.Context.SendActivityAsync(
                        MessageFactory.Text("I understand. Feel free to come back anytime you'd like to try the writing exercise!"),
                        cancellationToken);
                }
            }

            // End the dialog with a goodbye message
            await stepContext.Context.SendActivityAsync(
                MessageFactory.Text("Thanks for using our writing assistant. Have a great day!"),
                cancellationToken);

            return await stepContext.EndDialogAsync(null, cancellationToken);
        }
    }
}