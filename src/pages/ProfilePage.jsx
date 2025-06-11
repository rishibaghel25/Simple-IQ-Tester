import { useState, useEffect } from 'react'
import { supabase, useAuth } from '../App'
import { User, Mail, Award, Clock, Calendar, TrendingUp } from 'lucide-react'

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [testResults, setTestResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user) {
      fetchProfileAndResults()
    } else if (!authLoading && !user) {
      // Redirect to login if not authenticated
      // navigate('/login'); // Assuming you have navigate from useNavigate
    }
  }, [user, authLoading])

  const fetchProfileAndResults = async () => {
    setLoading(true)
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Fetch user's test results, ordered by IQ score descending
      const { data: resultsData, error: resultsError } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user.id)
        .order('iq_score', { ascending: false })

      if (resultsError) throw resultsError
      setTestResults(resultsData)

    } catch (error) {
      console.error('Error fetching profile or test results:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600">Please log in to view your profile.</p>
        {/* Add a login button or link if needed */}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          <User className="inline-block mr-2 h-8 w-8 text-blue-600" />
          My Profile
        </h1>
        <p className="text-gray-600">View your personal information and test history</p>
      </div>

      <div className="card mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-700">Name:</span>
            <span className="text-gray-900">{profile?.full_name || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-700">Email:</span>
            <span className="text-gray-900">{profile?.email || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Test Results</h2>
        {testResults.length === 0 ? (
          <div className="text-center py-8">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">No test results yet!</p>
            <p className="text-gray-500">Take an IQ test to see your results here.</p>
            {/* Add a link to take the test */}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IQ Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Taken</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-xl font-bold text-blue-600">
                      {result.iq_score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {result.score}/{result.total_questions} ({Math.round((result.score / result.total_questions) * 100)}%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {Math.floor(result.time_taken / 60)}:{(result.time_taken % 60).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage 