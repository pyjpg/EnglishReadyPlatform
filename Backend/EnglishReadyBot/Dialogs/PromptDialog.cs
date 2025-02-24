using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs;
using System.Threading.Tasks;
using System.Threading;
using System;
using EnglishReadyBot.Dialogs;

public class PromptDialog : ComponentDialog
{
    public PromptDialog() : base(nameof(PromptDialog))
    {
        var waterfallSteps = new WaterfallStep[]
        {
            AskForNameAsync,
            AskForAgeAsync, 
            StoreAgeAsync,
            ThankYouMessageAsync
        };

        AddDialog(new WaterfallDialog(nameof(WaterfallDialog), waterfallSteps));
        AddDialog(new TextPrompt(nameof(TextPrompt)));
        AddDialog(new OptionsDialog());
        AddDialog(new NumberPrompt<long>(nameof(NumberPrompt<long>))); // Add NumberPrompt for age
        InitialDialogId = nameof(WaterfallDialog);
    }

    private async Task<DialogTurnResult> StoreAgeAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
    {
        // Validate if the result is a valid long (age input)
        if (stepContext.Result is long age)
        {
            // Store the user's age
            stepContext.Values["age"] = age;

            // Debugging - log the stored values
            Console.WriteLine($"Age stored: {age}");
        }
        else
        {
            // Handle invalid age input (e.g., retry)
            await stepContext.Context.SendActivityAsync("Sorry, I didn't understand that. Could you please enter your age as a number?");

            // Reprompt the user for their age
            return await stepContext.PromptAsync("agePrompt", new PromptOptions
            {
                Prompt = MessageFactory.Text("Please enter your age as a number.")
            }, cancellationToken);
        }

        // Proceed to the next step
        return await stepContext.NextAsync(null, cancellationToken);
    }

    private async Task<DialogTurnResult> ThankYouMessageAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
    {
        // Debugging - Check if age exists in the values
        if (stepContext.Values.ContainsKey("age"))
        {
            var name = (string)stepContext.Values["name"];
            var age = (long)stepContext.Values["age"];

            // Send a thank-you message
            await stepContext.Context.SendActivityAsync(MessageFactory.Text($"Thank you, {name}! You are {age} years old. It's nice to meet you. \n\n" + 
                $"Here are some options for you can chose from."), cancellationToken);
        }
        else
        {
            // Log the error (if age was not found)
            await stepContext.Context.SendActivityAsync("It seems like I missed your age. Let's try again.");

            // Reprompt the user for their age
            return await stepContext.PromptAsync("agePrompt", new PromptOptions
            {
                Prompt = MessageFactory.Text("Could you please enter your age again?")
            }, cancellationToken);
        }

        return await stepContext.BeginDialogAsync(nameof(OptionsDialog),null, cancellationToken);
    }


    private async Task<DialogTurnResult> AskForNameAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
    {
        // Ask for the user's name
        return await stepContext.PromptAsync(nameof(TextPrompt), new PromptOptions
        {
            Prompt = MessageFactory.Text("What is your name?"),
            RetryPrompt = MessageFactory.Text("Sorry, I didn't get that. Please enter your name.")
        }, cancellationToken);
    }

    private async Task<DialogTurnResult> AskForAgeAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
    {
        // Store the user's name in stepContext.Values so it's available in later steps
        stepContext.Values["name"] = (string)stepContext.Result;

        // Ask for the user's age
        return await stepContext.PromptAsync(nameof(NumberPrompt<long>), new PromptOptions
        {
            Prompt = MessageFactory.Text($"Nice to meet you, {stepContext.Values["name"]}! How old are you?"),
            RetryPrompt = MessageFactory.Text("Sorry, I didn't get that. Please enter your age as a number.")
        }, cancellationToken);
    }

  }
