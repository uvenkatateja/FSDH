import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { clearCandidates, setSearchTerm, setSorting } from '../../store/candidatesSlice';
import InterviewerTabUI from './InterviewerTabUI';
import { 
  Clock, 
  CheckCircle, 
  XCircle
} from 'lucide-react';

const InterviewerTab = () => {
  const dispatch = useDispatch();
  const { candidates, searchTerm, sortBy, sortOrder } = useSelector((state: RootState) => state.candidates);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  // Handler functions
  const handleClearCandidates = () => {
    dispatch(clearCandidates());
  };

  const handleSetSearchTerm = (term: string) => {
    dispatch(setSearchTerm(term));
  };

  const handleSetSorting = (sorting: { sortBy: 'name' | 'score' | 'createdAt'; sortOrder: 'asc' | 'desc' }) => {
    dispatch(setSorting(sorting));
  };

  const handleSelectCandidate = (candidateId: string | null) => {
    setSelectedCandidate(candidateId);
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Filter and sort candidates
  const filteredCandidates = candidates.filter(candidate => 
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (candidate.position || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'score':
        aValue = a.score || a.finalScore || 0;
        bValue = b.score || b.finalScore || 0;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt || a.timestamp || new Date()).getTime();
        bValue = new Date(b.createdAt || b.timestamp || new Date()).getTime();
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return (aValue || 0) > (bValue || 0) ? 1 : -1;
    } else {
      return (aValue || 0) < (bValue || 0) ? 1 : -1;
    }
  });

  return (
    <InterviewerTabUI
      candidates={candidates}
      searchTerm={searchTerm}
      sortBy={sortBy}
      sortOrder={sortOrder}
      selectedCandidate={selectedCandidate}
      onClearCandidates={handleClearCandidates}
      onSetSearchTerm={handleSetSearchTerm}
      onSetSorting={handleSetSorting}
      onSelectCandidate={handleSelectCandidate}
      getStatusColor={getStatusColor}
      getStatusIcon={getStatusIcon}
      filteredAndSortedCandidates={sortedCandidates}
    />
  );
};

export default InterviewerTab;
