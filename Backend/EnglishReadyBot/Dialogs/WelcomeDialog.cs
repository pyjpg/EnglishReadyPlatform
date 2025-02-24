using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder;
using System.Threading.Tasks;
using System.Threading;
using System;

public class WelcomeDialog : ComponentDialog
{
    public WelcomeDialog(PromptDialog promptDialog) : base(nameof(WelcomeDialog))
    {
        // Register the PromptDialog here to ensure it's available in the WelcomeDialog
        AddDialog(promptDialog);  // Ensure PromptDialog is available for transitions

        var waterfallSteps = new WaterfallStep[]
        {
            WelcomeStepAsync,
            GetUserResponseAsync,   // Collect user input here
            FinalStepAsync          // Handle user input in the final step
        };

        AddDialog(new WaterfallDialog(nameof(WaterfallDialog), waterfallSteps));
        AddDialog(new TextPrompt(nameof(TextPrompt)));  // Add TextPrompt for capturing input

        InitialDialogId = nameof(WaterfallDialog);
    }

    // Step 1: Send a welcome message
    private async Task<DialogTurnResult> WelcomeStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
    {
        await stepContext.Context.SendActivityAsync("Welcome to the English Ready! How can I help you today?", cancellationToken: cancellationToken);
        return await stepContext.NextAsync(null, cancellationToken);
    }

    // Step 2: Prompt user for input
    private async Task<DialogTurnResult> GetUserResponseAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
    {
        // Asking the user for a response
        return await stepContext.PromptAsync(nameof(TextPrompt), new PromptOptions
        {
            Prompt = MessageFactory.Text("")
        }, cancellationToken);
    }

    // Step 3: Handle user message (echo or custom responses)
    private async Task<DialogTurnResult> FinalStepAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
    {
        // Retrieve the user's response
        var userMessage = stepContext.Result.ToString();

        if (userMessage != null)
        {
            return await stepContext.BeginDialogAsync(nameof(PromptDialog), null, cancellationToken);
        }
        
        // End the dialog
        return await stepContext.EndDialogAsync(null, cancellationToken);
    }
}
