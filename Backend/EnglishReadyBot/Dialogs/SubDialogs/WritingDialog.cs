using Microsoft.Bot.Builder.Dialogs;

namespace EnglishReadyBot.Dialogs.Operations
{
    public class WritingDialog : ComponentDialog
    {
        public WritingDialog() : base(nameof(WritingDialog)) 
        {
            var waterfullSteps = new WaterfallStep[]
            {

            };

            AddDialog(new WaterfallDialog(nameof(WaterfallDialog), waterfullSteps));
            AddDialog(new TextPrompt(nameof(TextPrompt)));

            InitialDialogId = nameof(WaterfallDialog);
        }
    }
}
