using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Schema;
using AdaptiveCards;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using System;
using Microsoft.Bot.Builder.Dialogs.Adaptive.Input;
using Microsoft.Bot.Builder.Dialogs.Choices;

namespace EnglishReadyBot.Dialogs.Operations
{
    public class ExerciseDialog : ComponentDialog
    {
        public ExerciseDialog() : base(nameof(ExerciseDialog))
        {
            var waterfallSteps = new WaterfallStep[]
            {
            DisplayTaskAsync,
            GetSectionChoiceAsync,
            GetWritingInputAsync,
            GradeResponseAsync,
            PromptForMoreSectionsAsync
            };

            AddDialog(new WaterfallDialog(nameof(WaterfallDialog), waterfallSteps));
            AddDialog(new TextPrompt(nameof(TextPrompt)));
            AddDialog(new ChoicePrompt(nameof(ChoicePrompt)));

            InitialDialogId = nameof(WaterfallDialog);
        }

       private async Task<DialogTurnResult> DisplayTaskAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
{
    var card = new AdaptiveCard(new AdaptiveSchemaVersion(1, 3));

    // Header Container with accent background
    var headerContainer = new AdaptiveContainer
    {
        Style = AdaptiveContainerStyle.Attention,
        Bleed = true,
        Items = new List<AdaptiveElement>
        {
            new AdaptiveTextBlock
            {
                Text = "IELTS Writing Task 1",
                Size = AdaptiveTextSize.Large,
                Weight = AdaptiveTextWeight.Bolder,
                Color = AdaptiveTextColor.Light,
                HorizontalAlignment = AdaptiveHorizontalAlignment.Center,
                Height = AdaptiveHeight.Auto,
                Spacing = AdaptiveSpacing.Medium
            }
        }
    };
    card.Body.Add(headerContainer);

    // Image with border
    card.Body.Add(new AdaptiveImage
    {
        Url = new Uri("C:\\Users\\titas\\Desktop\\Artefact\\ERChatBot\\EnglishReadyBot\\Images\\image.jpg"),
        Size = AdaptiveImageSize.Large,
        Style = AdaptiveImageStyle.Default,
        HorizontalAlignment = AdaptiveHorizontalAlignment.Center,
        Spacing = AdaptiveSpacing.Medium
    });

    // Task Instructions Container
    var instructionsContainer = new AdaptiveContainer
    {
        Style = AdaptiveContainerStyle.Emphasis,
        Spacing = AdaptiveSpacing.Medium,
        Items = new List<AdaptiveElement>
        {
            new AdaptiveTextBlock
            {
                Text = "📝 Task Instructions",
                Weight = AdaptiveTextWeight.Bolder,
                Size = AdaptiveTextSize.Medium,
                Color = AdaptiveTextColor.Accent,
                Spacing = AdaptiveSpacing.Small
            },
            new AdaptiveTextBlock
            {
                Text = "The graph above shows population growth in different regions. Write a report describing the key features and make comparisons where relevant. You should write at least 150 words.",
                Wrap = true,
                Size = AdaptiveTextSize.Default,
                Color = AdaptiveTextColor.Dark,
                Spacing = AdaptiveSpacing.Small
            }
        }
    };
    card.Body.Add(instructionsContainer);

    // Key Information Container
    var keyInfoContainer = new AdaptiveContainer
    {
        Spacing = AdaptiveSpacing.Medium,
        Style = AdaptiveContainerStyle.Default,
        Items = new List<AdaptiveElement>
        {
            new AdaptiveColumnSet
            {
                Columns = new List<AdaptiveColumn>
                {
                    new AdaptiveColumn
                    {
                        Width = "auto",
                        Items = new List<AdaptiveElement>
                        {
                            new AdaptiveTextBlock
                            {
                                Text = "⏱️ Time Allowed:",
                                Weight = AdaptiveTextWeight.Bolder,
                                Color = AdaptiveTextColor.Accent
                            }
                        }
                    },
                    new AdaptiveColumn
                    {
                        Width = "stretch",
                        Items = new List<AdaptiveElement>
                        {
                            new AdaptiveTextBlock
                            {
                                Text = "20 minutes",
                                Color = AdaptiveTextColor.Good
                            }
                        }
                    }
                }
            },
            new AdaptiveColumnSet
            {
                Spacing = AdaptiveSpacing.Small,
                Columns = new List<AdaptiveColumn>
                {
                    new AdaptiveColumn
                    {
                        Width = "auto",
                        Items = new List<AdaptiveElement>
                        {
                            new AdaptiveTextBlock
                            {
                                Text = "📝 Minimum Words:",
                                Weight = AdaptiveTextWeight.Bolder,
                                Color = AdaptiveTextColor.Accent
                            }
                        }
                    },
                    new AdaptiveColumn
                    {
                        Width = "stretch",
                        Items = new List<AdaptiveElement>
                        {
                            new AdaptiveTextBlock
                            {
                                Text = "150",
                                Color = AdaptiveTextColor.Good
                            }
                        }
                    }
                }
            }
        }
    };
    card.Body.Add(keyInfoContainer);

    // Writing Guidelines Container
    var guidelinesContainer = new AdaptiveContainer
    {
        Style = AdaptiveContainerStyle.Emphasis,
        Spacing = AdaptiveSpacing.Medium,
        Items = new List<AdaptiveElement>
        {
            new AdaptiveTextBlock
            {
                Text = "📋 Writing Guidelines",
                Weight = AdaptiveTextWeight.Bolder,
                Size = AdaptiveTextSize.Medium,
                Color = AdaptiveTextColor.Accent,
                Spacing = AdaptiveSpacing.Small
            },
            new AdaptiveTextBlock
            {
                Text = "• Introduction: Paraphrase the question and provide an overview",
                Wrap = true,
                Spacing = AdaptiveSpacing.Small
            },
            new AdaptiveTextBlock
            {
                Text = "• Analysis: Describe trends and include specific data",
                Wrap = true,
                Spacing = AdaptiveSpacing.Small
            },
            new AdaptiveTextBlock
            {
                Text = "• Conclusion: Summarize main points",
                Wrap = true,
                Spacing = AdaptiveSpacing.Small
            }
        }
    };
    card.Body.Add(guidelinesContainer);

    // Convert to attachment
    var attachment = new Attachment()
    {
        ContentType = AdaptiveCard.ContentType,
        Content = card
    };

    // Send the card
    var response = MessageFactory.Attachment(attachment);
    await stepContext.Context.SendActivityAsync(response, cancellationToken);

    return await stepContext.NextAsync(null, cancellationToken);
}
        private async Task<DialogTurnResult> GetSectionChoiceAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            return await stepContext.PromptAsync(
                nameof(ChoicePrompt),
                new PromptOptions
                {
                    Prompt = MessageFactory.Text("Which section would you like to write?"),
                    Choices = ChoiceFactory.ToChoices(new List<string> { "Introduction", "Analysis", "Conclusion" })
                },
                cancellationToken);
        }

        private async Task<DialogTurnResult> GetWritingInputAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            var selectedSection = (stepContext.Result as FoundChoice).Value;
            stepContext.Values["currentSection"] = selectedSection;

            // Provide section-specific guidance
            string guidance = GetSectionGuidance(selectedSection);
            await stepContext.Context.SendActivityAsync(guidance, cancellationToken: cancellationToken);

            return await stepContext.PromptAsync(
                nameof(TextPrompt),
                new PromptOptions
                {
                    Prompt = MessageFactory.Text($"Please write your {selectedSection}:")
                },
                cancellationToken);
        }

        private string GetSectionGuidance(string section)
        {
            switch (section)
            {
                case "Introduction":
                    return "In your introduction, you should:\n" +
                           "- Paraphrase the question\n" +
                           "- Give an overview of what the graph shows";
                case "Analysis":
                    return "In your analysis, you should:\n" +
                           "- Describe the main trends\n" +
                           "- Include specific data points\n" +
                           "- Make relevant comparisons";
                case "Conclusion":
                    return "In your conclusion, you should:\n" +
                           "- Summarize the main points\n" +
                           "- Do not introduce new information";
                default:
                    return string.Empty;
            }
        }

        private async Task<DialogTurnResult> GradeResponseAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            var userWriting = stepContext.Result as string;
            var section = stepContext.Values["currentSection"] as string;

            await stepContext.Context.SendActivityAsync(
                $"Grading your {section}...",
                cancellationToken: cancellationToken);

            // Add your grading logic here
            await stepContext.Context.SendActivityAsync(
                $"Feedback for your {section}: [Your feedback here]",
                cancellationToken: cancellationToken);

            return await stepContext.NextAsync(null, cancellationToken);
        }

        private async Task<DialogTurnResult> PromptForMoreSectionsAsync(WaterfallStepContext stepContext, CancellationToken cancellationToken)
        {
            return await stepContext.PromptAsync(
                nameof(ChoicePrompt),
                new PromptOptions
                {
                    Prompt = MessageFactory.Text("Would you like to write another section?"),
                    Choices = ChoiceFactory.ToChoices(new List<string> { "Yes", "No" })
                },
                cancellationToken);
        }
    }
}