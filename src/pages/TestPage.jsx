import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../App'
import { useAuth } from '../App'

const TestPage = () => {
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [testCompleted, setTestCompleted] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    loadQuestions()
    setStartTime(Date.now())
  }, [user])

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('iq_questions')
        .select('*')
        .order('difficulty_level', { ascending: true })
        // .limit(15) // Removed the limit to fetch all available questions

      if (error) throw error
      setQuestions(data)
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const calculateIQ = (score, totalQuestions) => {
    const percentage = (score / totalQuestions) * 100
    // Adjusted IQ calculation for a wider range: 70 to 145
    return Math.round(70 + (percentage / 100) * 75) // Min IQ 70, Max IQ 145 (70 + 75)
  }

  const submitTest = async () => {
    if (!user) return
    
    setSubmitting(true)
    const endTime = Date.now()
    const timeTaken = Math.round((endTime - startTime) / 1000)
    
    let correctAnswers = 0
    questions.forEach(question => {
      if (answers[question.id] === question.correct_answer) {
        correctAnswers++
      }
    })
    
    const iqScore = calculateIQ(correctAnswers, questions.length)
    
    try {
      const { error } = await supabase
        .from('test_results')
        .insert([
          {
            user_id: user.id,
            score: correctAnswers,
            total_questions: questions.length,
            iq_score: iqScore,
            time_taken: timeTaken,
          }
        ])
      
      if (error) throw error
      
      setTestResult({
        score: correctAnswers,
        totalQuestions: questions.length,
        iqScore,
        timeTaken
      })
      setTestCompleted(true)
      
    } catch (error) {
      console.error('Error submitting test:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    )
  }

  if (testCompleted && testResult) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="card text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-6">Test Complete!</h2>
          <div className="space-y-4 mb-8">
            <div className="text-6xl font-bold text-blue-600">{testResult.iqScore}</div>
            <p className="text-xl text-gray-700">Your IQ Score</p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{testResult.score}/{testResult.totalQuestions}</div>
                <p className="text-gray-600">Correct Answers</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{Math.floor(testResult.timeTaken / 60)}:{(testResult.timeTaken % 60).toString().padStart(2, '0')}</div>
                <p className="text-gray-600">Time Taken</p>
              </div>
            </div>
          </div>
          <div className="space-x-4">
            <Link to="/leaderboard" className="btn-primary">
              View Leaderboard
            </Link>
            <Link to="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</span>
          <span className="text-sm text-gray-600">Progress: {Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-6">{currentQ?.question}</h2>
        
        <div className="grid grid-cols-1 gap-3 mb-8">
          {currentQ?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(currentQ.id, index)}
              className={`p-4 text-left border rounded-lg transition-colors ${
                answers[currentQ.id] === index
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
              {option}
            </button>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={submitTest}
              disabled={submitting || Object.keys(answers).length !== questions.length}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={answers[currentQ.id] === undefined}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestPage 