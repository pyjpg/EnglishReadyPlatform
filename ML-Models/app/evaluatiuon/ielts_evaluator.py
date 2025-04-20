import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import sys
import os
import json
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, confusion_matrix

# Add parent directory to path to import the services
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.grammar_service import GrammarService
from services.lexical_service import LexicalService
from services.taskachievement_service import TaskAchievementService
from services.CoherenceCohensionService import CoherenceCohesionService


class IELTSEvaluator:
    def __init__(self):
        # Initialize the services
        self.grammar_service = GrammarService()
        self.lexical_service = LexicalService()
        self.task_achievement_service = TaskAchievementService()
        self.coherence_service = CoherenceCohesionService()
        
        # Define weights
        self.weights = {
            'grammar': 0.25,
            'lexical': 0.25,
            'task_achievement': 0.25,
            'coherence': 0.25
        }
        
        # Load the dataset
        self.data_path = Path(__file__).parent.parent / 'data' / 'ielts_writing_dataset.csv'
        self.df = pd.read_csv(self.data_path)
        self.df = self.df.dropna(subset=['Essay', 'Overall'])
        
        # Output directory
        self.output_dir = Path(__file__).parent / 'benchmark_results'
        self.output_dir.mkdir(exist_ok=True, parents=True)
    
    def calculate_combined_score(self, essay, question):
        """Calculate the combined score using all services with weights."""
        try:
            # Get individual scores
            grammar_score = self.grammar_service.analyze_grammar(essay)
            lexical_score = self.lexical_service.analyze_lexical(essay)
            
            # Fix: Use keyword arguments for task_achievement_service
            task_result = self.task_achievement_service.analyze_task_achievement(
                text=essay, 
                task_type="essay",
                question_desc=question
            )
            # Extract the band_score from the result
            task_score = task_result.get('band_score', 0)
            
            coherence_score = self.coherence_service.analyze_coherence_cohesion(essay)
            
            # For consistency, ensure all scores are floats
            if isinstance(grammar_score, dict):
                grammar_score = grammar_score.get('overall_score', 0)
            if isinstance(lexical_score, dict):
                lexical_score = lexical_score.get('overall_score', 0)
            if isinstance(coherence_score, dict):
                coherence_score = coherence_score.get('overall_score', 0)
            
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
        except Exception as e:
            print(f"Error evaluating essay: {e}")
            return 0, {
                'grammar': 0,
                'lexical': 0,
                'task_achievement': 0,
                'coherence': 0
            } 
        
    def round_to_nearest_half(self, score):
        """Round a score to the nearest 0.5."""
        return round(score * 2) / 2
    
    def percentage_difference(self, actual, predicted):
        """Calculate percentage difference between actual and predicted scores."""
        return abs(actual - predicted) / actual * 100 if actual != 0 else 0
        
    def run_benchmark(self, sample_size=None):
        """Run a comprehensive benchmark and generate reports."""
        if sample_size is None:
            sample_size = len(self.df)
        else:
            sample_size = min(sample_size, len(self.df))
        
        results = []
        actual_bands = []
        predicted_bands = []
        raw_actual = []
        raw_predicted = []
        component_results = {
            'grammar': [],
            'lexical': [],
            'task_achievement': [],
            'coherence': []
        }
        component_actual = {
            'grammar': [],
            'lexical': [],
            'task_achievement': [],
            'coherence': []
        }
        
        # Process samples
        for idx in range(sample_size):
            row = self.df.iloc[idx]
            essay = row['Essay']
            question = row['Question']
            actual_score = float(row['Overall'])
            
            # Get component actual scores if available
            if 'Range_Accuracy' in row and pd.notna(row['Range_Accuracy']):
                component_actual['grammar'].append((idx, float(row['Range_Accuracy'])))
            if 'Lexical_Resource' in row and pd.notna(row['Lexical_Resource']):
                component_actual['lexical'].append((idx, float(row['Lexical_Resource'])))
            if 'Task_Response' in row and pd.notna(row['Task_Response']):
                component_actual['task_achievement'].append((idx, float(row['Task_Response'])))
            if 'Coherence_Cohesion' in row and pd.notna(row['Coherence_Cohesion']):
                component_actual['coherence'].append((idx, float(row['Coherence_Cohesion'])))
            
            # Calculate predicted score
            predicted_score, component_scores = self.calculate_combined_score(essay, question)
            
            # Round to nearest 0.5 for IELTS bands
            actual_band = self.round_to_nearest_half(actual_score)
            predicted_band = self.round_to_nearest_half(predicted_score)
            
            # Store results
            results.append({
                'index': idx,
                'task_type': row.get('Task_Type', 'Unknown'),
                'actual_score': actual_score,
                'predicted_score': predicted_score,
                'actual_band': actual_band,
                'predicted_band': predicted_band,
                'components': component_scores
            })
            
            actual_bands.append(actual_band)
            predicted_bands.append(predicted_band)
            raw_actual.append(actual_score)
            raw_predicted.append(predicted_score)
            
            # Store component results
            for component, score in component_scores.items():
                component_results[component].append((idx, score))
            
            # Print progress for long runs
            if idx % 10 == 0 and idx > 0:
                print(f"Processed {idx}/{sample_size} samples...")
        
        # Generate reports
        self.generate_overall_report(results, raw_actual, raw_predicted)
        self.generate_component_reports(component_results, component_actual)
        self.generate_confusion_matrix(actual_bands, predicted_bands)
        self.generate_score_distribution(raw_actual, raw_predicted)
        self.generate_task_type_analysis(results)
        
        # Save detailed results
        with open(self.output_dir / 'detailed_results.json', 'w') as f:
            json.dump(results, f, indent=2)
        
        return results
    
    def generate_overall_report(self, results, actual, predicted):
        """Generate overall benchmark report."""
        mse = mean_squared_error(actual, predicted)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(actual, predicted)
        r2 = r2_score(actual, predicted)
        
        # Calculate percentage differences
        pdiffs = [self.percentage_difference(a, p) for a, p in zip(actual, predicted)]
        avg_pdiff = np.mean(pdiffs)
        
        # Calculate band accuracies
        exact_match = sum(1 for r in results if r['actual_band'] == r['predicted_band'])
        within_half = sum(1 for r in results if abs(r['actual_band'] - r['predicted_band']) <= 0.5)
        
        exact_percent = exact_match / len(results) * 100
        within_half_percent = within_half / len(results) * 100
        
        # Create report
        report = {
            'total_samples': len(results),
            'mean_squared_error': mse,
            'root_mean_squared_error': rmse,
            'mean_absolute_error': mae,
            'r2_score': r2,
            'average_percentage_difference': avg_pdiff,
            'exact_band_match_percent': exact_percent,
            'within_half_band_percent': within_half_percent
        }
        
        # Save report
        with open(self.output_dir / 'overall_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        # Print summary
        print("\nOverall Benchmark Results:")
        print(f"Total samples: {len(results)}")
        print(f"Mean Squared Error: {mse:.4f}")
        print(f"Root Mean Squared Error: {rmse:.4f}")
        print(f"Mean Absolute Error: {mae:.4f}")
        print(f"R² Score: {r2:.4f}")
        print(f"Average Percentage Difference: {avg_pdiff:.2f}%")
        print(f"Exact Band Match: {exact_percent:.2f}%")
        print(f"Within 0.5 Band: {within_half_percent:.2f}%")
        
        # Create scatter plot
        plt.figure(figsize=(10, 8))
        plt.scatter(actual, predicted, alpha=0.5)
        plt.plot([4, 9], [4, 9], 'r--')  # Perfect prediction line
        plt.xlabel('Actual Score')
        plt.ylabel('Predicted Score')
        plt.title('Actual vs. Predicted IELTS Scores')
        plt.grid(True)
        plt.axis('equal')
        plt.savefig(self.output_dir / 'actual_vs_predicted.png')
        
        return report
    
    def generate_component_reports(self, component_results, component_actual):
        """Generate reports for individual components."""
        component_metrics = {}
        
        for component in component_results:
            # Skip if no actual scores for comparison
            if len(component_actual[component]) == 0:
                continue
            
            # Match indices for fair comparison
            pred_dict = dict(component_results[component])
            actual_dict = dict(component_actual[component])
            
            # Get matched pairs
            matched_indices = set(pred_dict.keys()) & set(actual_dict.keys())
            
            if len(matched_indices) == 0:
                continue
                
            actual = [actual_dict[i] for i in matched_indices]
            predicted = [pred_dict[i] for i in matched_indices]
            
            # Calculate metrics
            mse = mean_squared_error(actual, predicted)
            rmse = np.sqrt(mse)
            mae = mean_absolute_error(actual, predicted)
            
            # Calculate percentage differences
            pdiffs = [self.percentage_difference(a, p) for a, p in zip(actual, predicted)]
            avg_pdiff = np.mean(pdiffs)
            
            component_metrics[component] = {
                'samples': len(matched_indices),
                'mse': mse,
                'rmse': rmse,
                'mae': mae,
                'avg_percentage_diff': avg_pdiff
            }
            
            # Create scatter plot
            plt.figure(figsize=(8, 6))
            plt.scatter(actual, predicted, alpha=0.5)
            plt.plot([4, 9], [4, 9], 'r--')  # Perfect prediction line
            plt.xlabel(f'Actual {component.capitalize()} Score')
            plt.ylabel(f'Predicted {component.capitalize()} Score')
            plt.title(f'{component.capitalize()} Score: Actual vs. Predicted')
            plt.grid(True)
            plt.savefig(self.output_dir / f'{component}_comparison.png')
        
        # Save component metrics
        with open(self.output_dir / 'component_metrics.json', 'w') as f:
            json.dump(component_metrics, f, indent=2)
        
        # Print summary
        print("\nComponent Metrics:")
        for component, metrics in component_metrics.items():
            print(f"\n{component.capitalize()}:")
            print(f"  Samples: {metrics['samples']}")
            print(f"  MSE: {metrics['mse']:.4f}")
            print(f"  RMSE: {metrics['rmse']:.4f}")
            print(f"  MAE: {metrics['mae']:.4f}")
            print(f"  Avg % Diff: {metrics['avg_percentage_diff']:.2f}%")
        
        return component_metrics
    
    def generate_confusion_matrix(self, actual_bands, predicted_bands):
        """Generate and visualize confusion matrix."""
        # Create all possible IELTS bands from 4 to 9
        all_bands = np.arange(4, 9.5, 0.5)
        
        # Generate confusion matrix
        cm = confusion_matrix(actual_bands, predicted_bands, labels=all_bands)
        
        # Plot confusion matrix
        plt.figure(figsize=(12, 10))
        sns.heatmap(cm, annot=True, fmt='d', xticklabels=all_bands, yticklabels=all_bands)
        plt.title('Confusion Matrix of IELTS Band Predictions')
        plt.xlabel('Predicted Band')
        plt.ylabel('Actual Band')
        plt.savefig(self.output_dir / 'confusion_matrix.png')
    
    def generate_score_distribution(self, actual, predicted):
        """Generate score distribution visualization."""
        plt.figure(figsize=(12, 6))
        
        plt.subplot(1, 2, 1)
        plt.hist(actual, bins=np.arange(4, 9.5, 0.5), alpha=0.7, label='Actual')
        plt.hist(predicted, bins=np.arange(4, 9.5, 0.5), alpha=0.7, label='Predicted')
        plt.xlabel('IELTS Score')
        plt.ylabel('Frequency')
        plt.title('Distribution of Actual vs Predicted Scores')
        plt.legend()
        plt.grid(True)
        
        plt.subplot(1, 2, 2)
        plt.boxplot([actual, predicted], labels=['Actual', 'Predicted'])
        plt.ylabel('IELTS Score')
        plt.title('Score Distribution')
        plt.grid(True)
        
        plt.tight_layout()
        plt.savefig(self.output_dir / 'score_distribution.png')
    
    def generate_task_type_analysis(self, results):
        """Generate analysis based on task types."""
        # Group by task type
        task_types = {}
        
        for result in results:
            task_type = result['task_type']
            if task_type not in task_types:
                task_types[task_type] = {
                    'actual': [],
                    'predicted': [],
                    'diff': []
                }
            
            task_types[task_type]['actual'].append(result['actual_score'])
            task_types[task_type]['predicted'].append(result['predicted_score'])
            task_types[task_type]['diff'].append(
                self.percentage_difference(result['actual_score'], result['predicted_score'])
            )
        
        # Calculate metrics by task type
        task_metrics = {}
        for task_type, data in task_types.items():
            if task_type == 'Unknown' or len(data['actual']) < 5:
                continue
                
            mse = mean_squared_error(data['actual'], data['predicted'])
            rmse = np.sqrt(mse)
            mae = mean_absolute_error(data['actual'], data['predicted'])
            avg_diff = np.mean(data['diff'])
            
            task_metrics[task_type] = {
                'samples': len(data['actual']),
                'mse': mse,
                'rmse': rmse,
                'mae': mae,
                'avg_percentage_diff': avg_diff
            }
        
        # Save task metrics
        with open(self.output_dir / 'task_type_metrics.json', 'w') as f:
            json.dump(task_metrics, f, indent=2)
        
        # Print summary
        print("\nTask Type Metrics:")
        for task_type, metrics in task_metrics.items():
            print(f"\n{task_type}:")
            print(f"  Samples: {metrics['samples']}")
            print(f"  MSE: {metrics['mse']:.4f}")
            print(f"  RMSE: {metrics['rmse']:.4f}")
            print(f"  MAE: {metrics['mae']:.4f}")
            print(f"  Avg % Diff: {metrics['avg_percentage_diff']:.2f}%")
        
        # Create bar chart for task type MAE
        if task_metrics:
            plt.figure(figsize=(12, 6))
            task_names = list(task_metrics.keys())
            mae_values = [metrics['mae'] for metrics in task_metrics.values()]
            
            plt.bar(task_names, mae_values)
            plt.xlabel('Task Type')
            plt.ylabel('Mean Absolute Error')
            plt.title('Evaluation Accuracy by Task Type')
            plt.xticks(rotation=45)
            plt.tight_layout()
            plt.savefig(self.output_dir / 'task_type_analysis.png')
        
        return task_metrics

    def evaluate_single_essay(self, essay, question):
        """Evaluate a single essay and provide detailed feedback."""
        # Calculate scores
        overall_score, component_scores = self.calculate_combined_score(essay, question)
        
        # Round to IELTS band
        band = self.round_to_nearest_half(overall_score)
        
        # Format results
        results = {
            'overall_score': overall_score,
            'ielts_band': band,
            'components': component_scores
        }
        
        # Print results
        print("\nEssay Evaluation Results:")
        print(f"Overall IELTS Band: {band}")
        print(f"Component Scores:")
        print(f"  Grammar & Accuracy: {component_scores['grammar']:.2f}")
        print(f"  Lexical Resource: {component_scores['lexical']:.2f}")
        print(f"  Task Achievement: {component_scores['task_achievement']:.2f}")
        print(f"  Coherence & Cohesion: {component_scores['coherence']:.2f}")
        
        return results
        
    def run_unit_tests(self):
        """Run basic unit tests to ensure components are working."""
        print("Running unit tests for evaluation components...")
        
        # Test with sample essays
        sample_size = min(5, len(self.df))
        all_tests_passed = True
        
        for idx in range(sample_size):
            row = self.df.iloc[idx]
            essay = row['Essay']
            question = row['Question']
            
            try:
                # Test grammar service
                grammar_result = self.grammar_service.analyze_grammar(essay)
                grammar_score = grammar_result['overall_score'] if isinstance(grammar_result, dict) else grammar_result
                assert 0 <= grammar_score <= 9, f"Grammar score out of range: {grammar_score}"
                
                # Test lexical service
                lexical_result = self.lexical_service.analyze_lexical(essay)
                lexical_score = lexical_result['overall_score'] if isinstance(lexical_result, dict) else lexical_result
                assert 0 <= lexical_score <= 9, f"Lexical score out of range: {lexical_score}"
                
                # Test task achievement service
                task_result = self.task_achievement_service.analyze_task_achievement(
                    text=essay, 
                    task_type="essay",
                    question_desc=question
                )
                # Look for band_score instead of overall_score based on your implementation
                task_score = task_result.get('band_score', 0)
                assert 0 <= task_score <= 9, f"Task score out of range: {task_score}" 
                
                # Test coherence service
                coherence_result = self.coherence_service.analyze_coherence_cohesion(essay)
                coherence_score = coherence_result['overall_score'] if isinstance(coherence_result, dict) else coherence_result
                assert 0 <= coherence_score <= 9, f"Coherence score out of range: {coherence_score}"
                
                # Test combined score
                combined_score, _ = self.calculate_combined_score(essay, question)
                assert 0 <= combined_score <= 9, f"Combined score out of range: {combined_score}"
                
                print(f"Sample {idx+1} passed all tests.")
            except Exception as e:
                print(f"Test failed for sample {idx+1}: {e}")
                all_tests_passed = False
        
        if all_tests_passed:
            print("All unit tests passed!")
        else:
            print("Some unit tests failed. Check the logs for details.")
        
        return all_tests_passed 


def main():
    """Main function to run the evaluation script."""
    import argparse
    
    parser = argparse.ArgumentParser(description='IELTS Essay Evaluation System')
    parser.add_argument('--benchmark', action='store_true', help='Run benchmark on the dataset')
    parser.add_argument('--sample-size', type=int, default=None, help='Number of samples for benchmark')
    parser.add_argument('--test', action='store_true', help='Run unit tests')
    parser.add_argument('--evaluate', action='store_true', help='Evaluate a single essay')
    parser.add_argument('--essay-file', type=str, help='File containing the essay to evaluate')
    parser.add_argument('--question', type=str, help='Essay question or prompt')
    
    args = parser.parse_args()
    
    evaluator = IELTSEvaluator()
    
    if args.test:
        evaluator.run_unit_tests()
    
    if args.benchmark:
        print(f"Running benchmark with {args.sample_size if args.sample_size else 'all'} samples...")
        evaluator.run_benchmark(args.sample_size)
    
    if args.evaluate:
        if not args.essay_file or not args.question:
            print("Error: --essay-file and --question are required for evaluation")
            return
        
        try:
            with open(args.essay_file, 'r', encoding='utf-8') as f:
                essay = f.read()
            
            evaluator.evaluate_single_essay(essay, args.question)
        
        except FileNotFoundError:
            print(f"Error: Essay file not found: {args.essay_file}")
    
    if not (args.test or args.benchmark or args.evaluate):
        parser.print_help()


if __name__ == '__main__':
    main()