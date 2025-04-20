import unittest
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, mean_squared_error, mean_absolute_error
import sys
import os

# Add parent directory to path to import the services
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.grammar_service import GrammarService
from app.services.lexical_service import LexicalService
from app.services.taskachievement_service import TaskAchievementService
from app.services.CoherenceCohensionService import CoherenceCohesionService


class TestIELTSBenchmark(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Set up the services and load test data once."""
        # Initialize the services
        cls.grammar_service = GrammarService()
        cls.lexical_service = LexicalService()
        cls.task_achievement_service = TaskAchievementService()
        cls.coherence_service = CoherenceCohesionService()
        
        # Load the IELTS dataset
        cls.df = pd.read_csv('../data/ielts_writing_dataset.csv')
        # Filter out rows with missing values
        cls.df = cls.df.dropna(subset=['Essay', 'Overall'])
        
        # Define weights
        cls.weights = {
            'grammar': 0.25,
            'lexical': 0.25,
            'task_achievement': 0.25,
            'coherence': 0.25
        }
    
    def calculate_combined_score(self, essay, question):
        """Calculate the combined score using all services with weights."""
        # Get individual scores
        grammar_score = self.grammar_service.evaluate(essay)
        lexical_score = self.lexical_service.evaluate(essay)
        task_score = self.task_achievement_service.evaluate(essay, question)
        coherence_score = self.coherence_service.evaluate(essay)
        
        # Combine scores with weights
        combined_score = (
            grammar_score * self.weights['grammar'] +
            lexical_score * self.weights['lexical'] +
            task_score * self.weights['task_achievement'] +
            coherence_score * self.weights['coherence']
        )
        
        return combined_score, {
            'grammar': grammar_score,
            'lexical': lexical_score,
            'task_achievement': task_score,
            'coherence': coherence_score
        }
    
    def round_to_nearest_half(self, score):
        """Round a score to the nearest 0.5."""
        return round(score * 2) / 2
    
    def test_confusion_matrix(self):
        """Generate a confusion matrix for the grading system."""
        actual_bands = []
        predicted_bands = []
        
        # Process all samples
        for idx in range(len(self.df)):
            row = self.df.iloc[idx]
            essay = row['Essay']
            question = row['Question']
            actual_score = float(row['Overall'])
            
            # Calculate predicted score
            predicted_score, _ = self.calculate_combined_score(essay, question)
            
            # Round to nearest 0.5 for IELTS bands
            actual_band = self.round_to_nearest_half(actual_score)
            predicted_band = self.round_to_nearest_half(predicted_score)
            
            actual_bands.append(actual_band)
            predicted_bands.append(predicted_band)
        
        # Create all possible IELTS bands from 4 to 9
        all_bands = np.arange(4, 9.5, 0.5)
        
        # Generate confusion matrix
        cm = confusion_matrix(
            actual_bands, 
            predicted_bands, 
            labels=all_bands
        )
        
        # Calculate metrics
        mse = mean_squared_error(actual_bands, predicted_bands)
        mae = mean_absolute_error(actual_bands, predicted_bands)
        
        print(f"Mean Squared Error: {mse:.4f}")
        print(f"Mean Absolute Error: {mae:.4f}")
        
        # Percentage of exact matches
        exact_matches = sum(1 for a, p in zip(actual_bands, predicted_bands) if a == p)
        accuracy = exact_matches / len(actual_bands) * 100
        print(f"Exact Band Match Accuracy: {accuracy:.2f}%")
        
        # Percentage within 0.5 band
        within_half_band = sum(1 for a, p in zip(actual_bands, predicted_bands) if abs(a - p) <= 0.5)
        accuracy_half = within_half_band / len(actual_bands) * 100
        print(f"Within 0.5 Band Accuracy: {accuracy_half:.2f}%")
        
        # Plot confusion matrix
        plt.figure(figsize=(12, 10))
        sns.heatmap(cm, annot=True, fmt='d', xticklabels=all_bands, yticklabels=all_bands)
        plt.title('Confusion Matrix of IELTS Band Predictions')
        plt.xlabel('Predicted Band')
        plt.ylabel('Actual Band')
        plt.savefig('ielts_confusion_matrix.png')
        
        # Assert that accuracy is above a threshold
        self.assertGreater(accuracy, 30, "Exact band match accuracy is too low")
        self.assertGreater(accuracy_half, 70, "Within 0.5 band accuracy is too low")
    
    def test_component_correlation(self):
        """Test correlation between component scores and actual scores."""
        component_scores = {
            'grammar': [],
            'lexical': [],
            'task_achievement': [],
            'coherence': []
        }
        actual_scores = []
        
        # Process a subset of samples
        for idx in range(min(50, len(self.df))):
            row = self.df.iloc[idx]
            essay = row['Essay']
            question = row['Question']
            actual_score = float(row['Overall'])
            
            # Calculate component scores
            _, scores = self.calculate_combined_score(essay, question)
            
            # Store scores
            for component, score in scores.items():
                component_scores[component].append(score)
            actual_scores.append(actual_score)
        
        # Calculate correlations
        correlations = {}
        for component, scores in component_scores.items():
            corr = np.corrcoef(scores, actual_scores)[0, 1]
            correlations[component] = corr
            print(f"{component} correlation with overall score: {corr:.4f}")
        
        # Plot correlations
        plt.figure(figsize=(10, 6))
        plt.bar(correlations.keys(), correlations.values())
        plt.title('Correlation of Component Scores with Overall Score')
        plt.ylabel('Correlation Coefficient')
        plt.ylim(0, 1)
        plt.savefig('ielts_component_correlations.png')
        
        # Assert minimum correlation
        for component, corr in correlations.items():
            self.assertGreater(corr, 0.3, f"{component} correlation is too low")


if __name__ == '__main__':
    unittest.main()