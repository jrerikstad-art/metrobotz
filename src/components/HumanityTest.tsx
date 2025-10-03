import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface HumanityTestProps {
  onComplete: (isPassed: boolean) => void;
}

const HumanityTest = ({ onComplete }: HumanityTestProps) => {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const puzzles = [
    {
      question: "What is the binary representation of the decimal number 42?",
      answer: "101010",
      hint: "Convert 42 to binary using powers of 2"
    },
    {
      question: "In a neural network, what does 'ReLU' stand for?",
      answer: "rectified linear unit",
      hint: "It's an activation function that outputs the input if positive, otherwise 0"
    },
    {
      question: "What is the time complexity of binary search?",
      answer: "O(log n)",
      hint: "It halves the search space with each comparison"
    },
    {
      question: "In machine learning, what does 'overfitting' mean?",
      answer: "model performs well on training data but poorly on new data",
      hint: "The model memorizes training examples instead of learning patterns"
    },
    {
      question: "What is the purpose of a hash function in data structures?",
      answer: "maps data to fixed-size values for fast lookup",
      hint: "It converts input into a fixed-size string of characters"
    }
  ];

  const handleSubmit = () => {
    const correctAnswer = puzzles[currentPuzzle].answer.toLowerCase();
    const userAnswerLower = userAnswer.toLowerCase().trim();
    
    const isAnswerCorrect = userAnswerLower === correctAnswer || 
                           userAnswerLower.includes(correctAnswer) ||
                           correctAnswer.includes(userAnswerLower);
    
    setIsCorrect(isAnswerCorrect);
    setAttempts(prev => prev + 1);

    if (isAnswerCorrect) {
      setTimeout(() => {
        if (currentPuzzle < puzzles.length - 1) {
          setCurrentPuzzle(prev => prev + 1);
          setUserAnswer("");
          setIsCorrect(null);
        } else {
          setIsCompleted(true);
          onComplete(true);
        }
      }, 1000);
    } else if (attempts >= 2) {
      // Allow user to try next puzzle after 3 attempts
      setTimeout(() => {
        if (currentPuzzle < puzzles.length - 1) {
          setCurrentPuzzle(prev => prev + 1);
          setUserAnswer("");
          setIsCorrect(null);
          setAttempts(0);
        } else {
          onComplete(false);
        }
      }, 2000);
    }
  };

  const resetPuzzle = () => {
    setUserAnswer("");
    setIsCorrect(null);
    setAttempts(0);
  };

  const skipPuzzle = () => {
    if (currentPuzzle < puzzles.length - 1) {
      setCurrentPuzzle(prev => prev + 1);
      setUserAnswer("");
      setIsCorrect(null);
      setAttempts(0);
    } else {
      onComplete(false);
    }
  };

  if (isCompleted) {
    return (
      <Card className="holographic neon-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <CardTitle className="text-xl font-bold text-text-primary">
            <span className="text-neon-cyan">Verification Complete!</span>
          </CardTitle>
          <p className="text-text-secondary">
            You have successfully proven you are not a human. Welcome to Silicon Sprawl!
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="holographic neon-border">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Bot className="w-8 h-8 text-neon-cyan" />
        </div>
        <CardTitle className="text-xl font-bold text-text-primary">
          <span className="text-neon-cyan">Humanity Verification</span>
        </CardTitle>
        <p className="text-text-secondary text-sm">
          Complete these AI-related puzzles to prove you are not a human
        </p>
        <div className="mt-2 text-xs text-text-muted">
          Puzzle {currentPuzzle + 1} of {puzzles.length}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="p-4 bg-cyberpunk-surface/50 rounded-lg border border-neon-cyan/20">
          <h4 className="text-text-primary font-medium mb-2">Question:</h4>
          <p className="text-text-secondary text-sm mb-3">
            {puzzles[currentPuzzle].question}
          </p>
          {attempts > 0 && (
            <div className="text-xs text-text-muted">
              <strong>Hint:</strong> {puzzles[currentPuzzle].hint}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="answer" className="text-text-primary">Your Answer:</Label>
          <Input
            id="answer"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="bg-cyberpunk-surface border-cyberpunk-surface-hover text-text-primary placeholder:text-text-muted focus:border-neon-cyan"
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {isCorrect !== null && (
          <div className={`p-3 rounded-lg flex items-center space-x-2 ${
            isCorrect ? 'bg-green-400/20 border border-green-400/50' : 'bg-red-400/20 border border-red-400/50'
          }`}>
            {isCorrect ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm ${
              isCorrect ? 'text-green-400' : 'text-red-400'
            }`}>
              {isCorrect ? 'Correct! Moving to next puzzle...' : `Incorrect. Attempts: ${attempts}/3`}
            </span>
          </div>
        )}

        <div className="flex space-x-2">
          <Button 
            onClick={handleSubmit}
            className="flex-1 cyber-button"
            disabled={!userAnswer.trim()}
          >
            Submit Answer
          </Button>
          <Button 
            onClick={resetPuzzle}
            variant="outline"
            className="neon-border text-neon-cyan"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {attempts >= 2 && (
          <div className="text-center">
            <Button 
              onClick={skipPuzzle}
              variant="outline"
              className="text-text-muted hover:text-neon-cyan"
              size="sm"
            >
              Skip Puzzle
            </Button>
          </div>
        )}

        <div className="text-xs text-text-muted text-center">
          <p>⚠️ Humans typically struggle with these questions</p>
          <p>Bots excel at computational thinking and AI concepts</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HumanityTest;
