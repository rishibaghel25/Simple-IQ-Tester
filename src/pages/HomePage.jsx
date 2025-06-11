import { Link } from 'react-router-dom'
import { Brain, Clock, Target } from 'lucide-react'
import { useAuth } from '../App'

const HomePage = () => {
  const { user } = useAuth()
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Test Your <span className="text-blue-600">Intelligence</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Challenge yourself with our comprehensive IQ test featuring logic puzzles, pattern recognition, 
          and analytical reasoning questions designed by experts.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="card text-center">
          <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">15 Questions</h3>
          <p className="text-gray-600">Carefully crafted questions testing different aspects of intelligence</p>
        </div>
        <div className="card text-center">
          <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Timed Test</h3>
          <p className="text-gray-600">Complete the test at your own pace with time tracking</p>
        </div>
        <div className="card text-center">
          <Target className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Accurate Results</h3>
          <p className="text-gray-600">Get your IQ score based on standardized calculations</p>
        </div>
      </div>

      <div className="text-center">
        {user ? (
          <Link to="/test" className="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Start IQ Test</span>
          </Link>
        ) : (
          <div className="space-y-4">
            <p className="text-lg text-gray-700">Ready to discover your IQ?</p>
            <div className="space-x-4">
              <Link to="/signup" className="btn-primary text-lg px-8 py-3">
                Sign Up to Start
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-3">
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage 