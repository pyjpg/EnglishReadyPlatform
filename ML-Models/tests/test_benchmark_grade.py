import unittest
import pandas as pd
import numpy as np
import sys
import os
from pathlib import Path

# Add parent directory to path to import the services
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.grammar_service import GrammarService
from app.services.lexical_service import LexicalService
from app.services.taskachievement_service import TaskAchievementService
from app.services.CoherenceCohensionService import CoherenceCohesionService


class TestIELTSGrading(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Set up the services and load test data once for all tests."""
        # Initialize the services
        cls.grammar_service = GrammarService()
        cls.lexical_service = LexicalService()
        cls.task_achievement_service = TaskAchievementService()
        cls.coherence_service = CoherenceCohesionService()
        
        # Load the IELTS dataset
        cls.df = pd.read_csv(Path(__file__).parent.parent / 'data' / 'ielts_writing_dataset.csv')
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
    
    def percentage_difference(self, actual, predicted):
        """Calculate percentage difference between actual and predicted scores."""
        return abs(actual - predicted) / actual * 100
    
    def test_overall_accuracy(self):
        """Test the overall accuracy of the grading system."""
        differences = []
        component_differences = {
            'grammar': [],
            'lexical': [],
            'task_achievement': [],
            'coherence': []
        }
        
        # Limit to first 20 samples for faster testing
        test_samples = min(20, len(self.df))
        
        for idx in range(test_samples):
            row = self.df.iloc[idx]
            essay = row['Essay']
            question = row['Question']
            actual_score = float(row['Overall'])
            
            # Get component scores if available
            actual_grammar = float(row.get('Range_Accuracy', 0)) if pd.notna(row.get('Range_Accuracy', 0)) else None
            actual_lexical = float(row.get('Lexical_Resource', 0)) if pd.notna(row.get('Lexical_Resource', 0)) else None
            actual_task = float(row.get('Task_Response', 0)) if pd.notna(row.get('Task_Response', 0)) else None
            actual_coherence = float(row.get('Coherence_Cohesion', 0)) if pd.notna(row.get('Coherence_Cohesion', 0)) else None
            
            # Calculate predicted score
            predicted_score, component_scores = self.calculate_combined_score(essay, question)
            
            # Calculate percentage difference
            diff = self.percentage_difference(actual_score, predicted_score)
            differences.append(diff)
            
            # Calculate component differences if available
            if actual_grammar is not None:
                component_differences['grammar'].append(
                    self.percentage_difference(actual_grammar, component_scores['grammar'])
                )
            if actual_lexical is not None:
                component_differences['lexical'].append(
                    self.percentage_difference(actual_lexical, component_scores['lexical'])
                )
            if actual_task is not None:
                component_differences['task_achievement'].append(
                    self.percentage_difference(actual_task, component_scores['task_achievement'])
                )
            if actual_coherence is not None:
                component_differences['coherence'].append(
                    self.percentage_difference(actual_coherence, component_scores['coherence'])
                )
            
            # Print individual results for debugging
            print(f"Sample {idx+1}:")
            print(f"Actual: {actual_score}, Predicted: {predicted_score:.2f}, Difference: {diff:.2f}%")
            print(f"Component Scores - Grammar: {component_scores['grammar']:.2f}, Lexical: {component_scores['lexical']:.2f}, "
                  f"Task: {component_scores['task_achievement']:.2f}, Coherence: {component_scores['coherence']:.2f}")
            print("-" * 80)
        
        # Calculate average differences
        avg_difference = np.mean(differences)
        
        # Calculate component average differences
        component_avg_differences = {}
        for component, diffs in component_differences.items():
            if diffs:  # Only calculate if we have data
                component_avg_differences[component] = np.mean(diffs)
        
        print(f"Average Percentage Difference: {avg_difference:.2f}%")
        print("Component Average Differences:")
        for component, avg_diff in component_avg_differences.items():
            print(f"{component}: {avg_diff:.2f}%")
        
        # Assert that the average difference is below a threshold (e.g., 15%)
        self.assertLess(avg_difference, 15, "Average difference exceeds acceptable threshold")
    
    def test_task_type_accuracy(self):
        """Test the accuracy based on task type."""
        # Group by task type
        task_types = self.df['Task_Type'].unique()
        
        for task_type in task_types:
            if pd.isna(task_type):
                continue
                
            # Filter data for this task type
            task_df = self.df[self.df['Task_Type'] == task_type]
            
            differences = []
            for idx in range(min(10, len(task_df))):
                row = task_df.iloc[idx]
                essay = row['Essay']
                question = row['Question']
                actual_score = float(row['Overall'])
                
                # Calculate predicted score
                predicted_score, _ = self.calculate_combined_score(essay, question)
                
                # Calculate percentage difference
                diff = self.percentage_difference(actual_score, predicted_score)
                differences.append(diff)
            
            if differences:
                avg_difference = np.mean(differences)
                print(f"Task Type {task_type} - Average Difference: {avg_difference:.2f}%")
                
                # Assert that the average difference is below a threshold
                self.assertLess(avg_difference, 20, f"Task Type {task_type} exceeds acceptable threshold")
    
    def test_score_distribution(self):
        """Test if the predicted scores follow a similar distribution to actual scores."""
        actual_scores = []
        predicted_scores = []
        
        # Limit to first 30 samples for distribution analysis
        test_samples = min(30, len(self.df))
        
        for idx in range(test_samples):
            row = self.df.iloc[idx]
            essay = row['Essay']
            question = row['Question']
            actual_score = float(row['Overall'])
            
            # Calculate predicted score
            predicted_score, _ = self.calculate_combined_score(essay, question)
            
            actual_scores.append(actual_score)
            predicted_scores.append(predicted_score)
        
        # Calculate mean and standard deviation
        actual_mean = np.mean(actual_scores)
        predicted_mean = np.mean(predicted_scores)
        actual_std = np.std(actual_scores)
        predicted_std = np.std(predicted_scores)
        
        print(f"Actual Scores - Mean: {actual_mean:.2f}, Std: {actual_std:.2f}")
        print(f"Predicted Scores - Mean: {predicted_mean:.2f}, Std: {predicted_std:.2f}")
        
        # Assert that means are close
        self.assertLess(abs(actual_mean - predicted_mean), 1.0, 
                       "Mean of predicted scores differs significantly from actual scores")
        
        # Assert that standard deviations are close
        self.assertLess(abs(actual_std - predicted_std), 1.0,
                       "Standard deviation of predicted scores differs significantly")


if __name__ == '__main__':
    unittest.main()
