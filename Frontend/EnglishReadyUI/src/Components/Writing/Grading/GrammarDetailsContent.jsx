export const GrammarDetailsContent = ({ grammarAnalysis }) => {
  if (!grammarAnalysis) return null;

  const getImprovementTips = (score) => {
    if (score >= 8) return ["Advanced structures", "Punctuation refinement", "Stylistic variations"];
    if (score >= 7) return ["Tense consistency", "Article usage", "Relative clauses"];
    if (score >= 6) return ["Subject-verb agreement", "Comma usage", "Prepositions"];
    return ["Basic structure", "Verb tenses", "Complete sentences"];
  };

  const generalTips = [
    "Check subject-verb agreement",
    "Use commas properly",
    "Maintain consistent tenses",
    "Use articles correctly"
  ];

  const specificFeedback = grammarAnalysis.feedback && (
    <div className="space-y-3">
      {grammarAnalysis.feedback.split('. ').map((point, i) => (
        <p key={i} className="text-blue-800">
          {point.replace(/\.$/, '')}.
        </p>
      ))}
    </div>
  );

  return (
    <ContentTemplate
      emoji="⚡"
      title="Grammar Mastery"
      scoreData={{ overall_score: grammarAnalysis.overall_score }}
      componentScores={grammarAnalysis.component_scores}
      improvementTips={getImprovementTips(grammarAnalysis.overall_score)}
      generalTips={generalTips}
      sentenceAnalysis={grammarAnalysis.sentence_analysis}
      specificFeedback={specificFeedback}
    />
  );
};
