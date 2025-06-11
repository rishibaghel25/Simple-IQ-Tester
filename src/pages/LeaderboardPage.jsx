import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { supabase } from '../App'
import { useAuth } from '../App'

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select(`
          iq_score,
          score,
          total_questions,
          time_taken,
          created_at,
          user_id,
          profiles(full_name)
        `)
        .order('user_id', { ascending: true })
        .order('iq_score', { ascending: false })
        .order('created_at', { ascending: false })
        // .limit(50) // No limit here, will limit after client-side distinct

      if (error) throw error
      
      // Manually apply distinct on user_id to get only the highest score per user
      const uniqueUserScores = {}
      data.forEach(item => {
        if (item.user_id) {
          // Only keep the entry if it's the first one for this user or has a higher IQ score
          if (!uniqueUserScores[item.user_id] || item.iq_score > uniqueUserScores[item.user_id].iq_score) {
            uniqueUserScores[item.user_id] = item
          }
        }
      })

      // Convert object back to array and sort by IQ score for final display, then limit to top 50
      const finalLeaderboard = Object.values(uniqueUserScores).sort((a, b) => b.iq_score - a.iq_score).slice(0, 50)

      setLeaderboard(finalLeaderboard || [])
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Leaderboard</h1>
        <p className="text-gray-600">Top performers on the SimpleIQ Test</p>
      </div>

      <div className="card">
        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">No results yet!</p>
            <p className="text-gray-500">Be the first to take the test and claim the top spot.</p>
            {user && (
              <Link to="/test" className="btn-primary mt-4 inline-block">
                Take Test Now
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">IQ Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Accuracy</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((result, index) => (
                  <tr key={result.id} className={`border-b border-gray-100 ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100' : 'hover:bg-gray-50'}`}>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                        {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                        {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                        <span className="font-semibold text-gray-900">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{result.profiles?.full_name || 'Anonymous'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-2xl font-bold text-blue-600">{result.iq_score}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-900">
                        {result.score}/{result.total_questions}
                        <span className="text-sm text-gray-500 ml-1">
                          ({Math.round((result.score / result.total_questions) * 100)}%)
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-700">
                        {Math.floor(result.time_taken / 60)}:{(result.time_taken % 60).toString().padStart(2, '0')}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-500 text-sm">
                        {new Date(result.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!user && leaderboard.length > 0 && (
        <div className="text-center mt-8">
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Want to join the leaderboard?</h3>
            <p className="text-blue-700 mb-4">Sign up now and test your IQ to see how you rank!</p>
            <div className="space-x-3">
              <Link to="/signup" className="btn-primary">
                Sign Up
              </Link>
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeaderboardPage 