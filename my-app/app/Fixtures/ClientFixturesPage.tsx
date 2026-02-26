'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import { useUserStore } from '@/store/useUserStore';

interface Match {
  idEvent: string;
  strEvent: string;
  strLeague: string;
  strSeason: string;
  strHomeTeam: string;
  strAwayTeam: string;
  dateEvent: string;
  strTime: string;
  strVenue: string;
  strHomeTeamBadge: string;
  strAwayTeamBadge: string;
  intRound: string;
  status?: string;
  score?: any;
}

interface LeagueMatches {
  leagueId: string;
  leagueName: string;
  leagueColor: string;
  leagueLogo: any;
  matches: Match[];
  allMatches: Match[];
  currentWeekStart: number;
  loading: boolean;
  error: string | null;
}

interface Reminder {
  id: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  gameDate: string;
  gameTime: string;
  reminderTitle: string;
  reminderNote: string;
  reminderDate: string;
}

interface LeagueData {
  id: string;
  name: string;
  color: string;
  logo: any;
  code: string;
}

const MATCHES_PER_WEEK = 5;

export default function ClientFixturesPage({ 
  initialMatches, 
  initialError,
  leagueData 
}: { 
  initialMatches: Match[];
  initialError: string | null;
  leagueData: any[];
}) {
  const router = useRouter();
  // User store for authentication checks
  const { user } = useUserStore();
  
  const LEAGUES: LeagueData[] = leagueData.map(leagueObj => {
    const leagueKey = Object.keys(leagueObj)[0];
    const league = leagueObj[leagueKey as keyof typeof leagueObj];
    return {
      id: league.id,
      name: league.title,
      color: league.hoverColor,
      logo: league.logo,
      code: league.code || getLeagueCode(league.title)
    };
  });

  function getLeagueCode(leagueName: string): string {
    const codes: Record<string, string> = {
      'Premier League': 'PL',
      'LaLiga': 'PD',
      'Serie A': 'SA',
      'Bundesliga': 'BL1'
    };
    return codes[leagueName] || 'PL';
  }

  const [leagueMatches, setLeagueMatches] = useState<LeagueMatches[]>(
    LEAGUES.map(league => ({
      leagueId: league.id,
      leagueName: league.name,
      leagueColor: league.color,
      leagueLogo: league.logo,
      matches: league.id === '4328' ? initialMatches : [],
      allMatches: league.id === '4328' ? initialMatches : [],
      currentWeekStart: 0,
      loading: league.id !== '4328',
      error: league.id === '4328' ? initialError : null
    }))
  );

  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('4328');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [isLoadingReminders, setIsLoadingReminders] = useState(false);
  const [notification, setNotification] = useState<{show: boolean; message: string; type: 'success' | 'error' | 'warning'}>({
    show: false,
    message: '',
    type: 'success'
  });
  
  // Reminder popup state
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<{
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    gameDate: string;
    gameTime: string;
    reminder?: Reminder;
  } | null>(null);
  const [reminderForm, setReminderForm] = useState({
    title: '',
    note: '',
    reminderDate: ''
  });
  const [dateError, setDateError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Load reminders from database when user logs in
  useEffect(() => {
    if (user) {
      fetchReminders();
    } else {
      setReminders([]);
    }
  }, [user]);

  const fetchReminders = async () => {
    setIsLoadingReminders(true);
    try {
      const response = await fetch('/api/reminders');
      if (response.ok) {
        const data = await response.json();
        setReminders(data.reminders || []);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setIsLoadingReminders(false);
    }
  };

  // Fetch matches for a specific league
  const fetchMatchesForLeague = async (leagueId: string) => {
    const league = LEAGUES.find(l => l.id === leagueId);
    if (!league) return;

    setLeagueMatches(prev => prev.map(item => 
      item.leagueId === leagueId 
        ? { ...item, loading: true, error: null }
        : item
    ));

    try {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const dateFrom = today.toISOString().split('T')[0];
      const dateTo = nextWeek.toISOString().split('T')[0];

      const response = await fetch(
        `/api/football-fixtures?leagueId=${leagueId}&dateFrom=${dateFrom}&dateTo=${dateTo}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch ${league.name} matches`);
      }
      
      const data = await response.json();
      const allMatches = data.matches || [];
      
      setLeagueMatches(prev => prev.map(item => 
        item.leagueId === leagueId 
          ? { 
              ...item, 
              allMatches, 
              matches: allMatches.slice(0, MATCHES_PER_WEEK),
              currentWeekStart: 0,
              loading: false, 
              error: null 
            }
          : item
      ));
    } catch (err) {
      setLeagueMatches(prev => prev.map(item => 
        item.leagueId === leagueId 
          ? { ...item, loading: false, error: err instanceof Error ? err.message : 'Unknown error' }
          : item
      ));
    }
  };

  // Fetch data for all leagues on mount
  useEffect(() => {
    LEAGUES.forEach(league => {
      if (league.id !== '4328') { // Skip Premier League as it has initial data
        fetchMatchesForLeague(league.id);
      }
    });
  }, []);

  const handleNextWeek = (leagueId: string) => {
    setLeagueMatches(prev => prev.map(league => {
      if (league.leagueId === leagueId) {
        const newWeekStart = league.currentWeekStart + MATCHES_PER_WEEK;

        if (newWeekStart < league.allMatches.length) {
          return {
            ...league,
            currentWeekStart: newWeekStart,
            matches: league.allMatches.slice(newWeekStart, newWeekStart + MATCHES_PER_WEEK)
          };
        }
      }
      return league;
    }));
  };

  const handlePreviousWeek = (leagueId: string) => {
    setLeagueMatches(prev => prev.map(league => {
      if (league.leagueId === leagueId) {
        const newWeekStart = Math.max(0, league.currentWeekStart - MATCHES_PER_WEEK);
        return {
          ...league,
          currentWeekStart: newWeekStart,
          matches: league.allMatches.slice(newWeekStart, newWeekStart + MATCHES_PER_WEEK)
        };
      }
      return league;
    }));
  };

  const validateReminderDate = (selectedDate: string, matchDate: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reminderDate = new Date(selectedDate);
    reminderDate.setHours(0, 0, 0, 0);
    
    const matchDateObj = new Date(matchDate);
    matchDateObj.setHours(0, 0, 0, 0);
    
    if (reminderDate < today) {
      setDateError('Reminder date cannot be in the past');
      return false;
    }
    
    if (reminderDate > matchDateObj) {
      setDateError('Reminder cannot be set after the match date');
      return false;
    }
    
    setDateError('');
    return true;
  };

  const addToWatchlist = (match: Match) => {
    // Check authentication first - redirect to signin if not logged in
    if (!user) {
      // Show a brief notification before redirect
      setNotification({
        show: true,
        message: 'Please sign in to set reminders. Redirecting...',
        type: 'warning'
      });
      
      // Redirect to signin page after a short delay
      setTimeout(() => {
        router.push('/SignIn');
      }, 1500);
      
      return;
    }

    // Check if reminder already exists
    const existingReminder = reminders.find(r => r.matchId === match.idEvent);
    
    if (existingReminder) {
      // Open popup in edit mode
      setSelectedMatch({
        matchId: match.idEvent,
        homeTeam: match.strHomeTeam,
        awayTeam: match.strAwayTeam,
        league: match.strLeague,
        gameDate: match.dateEvent,
        gameTime: match.strTime,
        reminder: existingReminder
      });
      setReminderForm({
        title: existingReminder.reminderTitle,
        note: existingReminder.reminderNote,
        reminderDate: existingReminder.reminderDate
      });
      setDateError('');
      setShowReminderPopup(true);
      
      setNotification({
        show: true,
        message: 'Reminder already exists. You can edit it below.',
        type: 'warning'
      });
    } else {
      // New reminder
      const matchDateObj = new Date(match.dateEvent);
      const defaultReminderDate = new Date(matchDateObj);
      defaultReminderDate.setDate(matchDateObj.getDate() - 1);
      
      setSelectedMatch({
        matchId: match.idEvent,
        homeTeam: match.strHomeTeam,
        awayTeam: match.strAwayTeam,
        league: match.strLeague,
        gameDate: match.dateEvent,
        gameTime: match.strTime
      });
      setReminderForm({
        title: `${match.strHomeTeam} vs ${match.strAwayTeam}`,
        note: '',
        reminderDate: defaultReminderDate.toISOString().split('T')[0]
      });
      setDateError('');
      setShowReminderPopup(true);
    }

    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const removeFromWatchlist = async (matchId: string) => {
    // Check authentication first - redirect to signin if not logged in
    if (!user) {
      setNotification({
        show: true,
        message: 'Please sign in to manage reminders. Redirecting...',
        type: 'warning'
      });
      
      setTimeout(() => {
        router.push('/SignIn');
      }, 1500);
      return;
    }

    try {
      const response = await fetch(`/api/reminders?matchId=${matchId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReminders(prev => prev.filter(r => r.matchId !== matchId));
        setNotification({
          show: true,
          message: 'Reminder deleted successfully',
          type: 'success'
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete reminder');
      }
    } catch (error: any) {
      setNotification({
        show: true,
        message: error.message || 'Failed to delete reminder',
        type: 'error'
      });
    } finally {
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 3000);
    }
  };

  const openReminderPopup = (reminder: Reminder) => {
    // Check authentication first - redirect to signin if not logged in
    if (!user) {
      setNotification({
        show: true,
        message: 'Please sign in to edit reminders. Redirecting...',
        type: 'warning'
      });
      
      setTimeout(() => {
        router.push('/SignIn');
      }, 1500);
      return;
    }

    setSelectedMatch({
      matchId: reminder.matchId,
      homeTeam: reminder.homeTeam,
      awayTeam: reminder.awayTeam,
      league: reminder.league,
      gameDate: reminder.gameDate,
      gameTime: reminder.gameTime,
      reminder
    });
    setReminderForm({
      title: reminder.reminderTitle,
      note: reminder.reminderNote,
      reminderDate: reminder.reminderDate
    });
    setDateError('');
    setShowReminderPopup(true);
  };

  const saveReminder = async () => {
    if (!selectedMatch) return;

    const isValid = validateReminderDate(
      reminderForm.reminderDate,
      selectedMatch.gameDate
    );

    if (!isValid) return;

    setIsSaving(true);

    try {
      const isEditing = !!selectedMatch.reminder;
      const url = '/api/reminders';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId: selectedMatch.matchId,
          homeTeam: selectedMatch.homeTeam,
          awayTeam: selectedMatch.awayTeam,
          league: selectedMatch.league,
          gameDate: selectedMatch.gameDate,
          gameTime: selectedMatch.gameTime,
          reminderTitle: reminderForm.title,
          reminderNote: reminderForm.note,
          reminderDate: reminderForm.reminderDate
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save reminder');
      }

      // Refresh reminders from database
      await fetchReminders();

      setShowReminderPopup(false);
      setSelectedMatch(null);
      
      setNotification({
        show: true,
        message: isEditing ? 'Reminder updated successfully!' : 'Reminder created successfully!',
        type: 'success'
      });

    } catch (error: any) {
      setNotification({
        show: true,
        message: error.message || 'Failed to save reminder',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 3000);
    }
  };

  const exportRemindersToPDF = async () => {
    // Check authentication first - redirect to signin if not logged in
    if (!user) {
      setNotification({
        show: true,
        message: 'Please sign in to export reminders. Redirecting...',
        type: 'warning'
      });
      
      setTimeout(() => {
        router.push('/SignIn');
      }, 1500);
      return;
    }

    try {
      if (reminders.length === 0) {
        setNotification({
          show: true,
          message: 'No reminders to export!',
          type: 'error'
        });
        setTimeout(() => {
          setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
        return;
      }

      // Create a new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 20;

      // Helper function to add text with word wrap
      const addWrappedText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += fontSize * 0.5;
        });
      };

      // Add header
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text('MY FOOTBALL REMINDERS', margin, yPosition);
      yPosition += 15;

      // Add generation date
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const dateStr = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Generated on: ${dateStr}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Total Reminders: ${reminders.length}`, margin, yPosition);
      yPosition += 15;

      // Add each reminder
      reminders.forEach((item, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${item.homeTeam} vs ${item.awayTeam}`, margin, yPosition);
        yPosition += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        
        const matchDate = new Date(item.gameDate);
        const matchDateStr = matchDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        doc.text(`League: ${item.league}`, margin + 5, yPosition);
        yPosition += 7;
        doc.text(`Match Date: ${matchDateStr} at ${item.gameTime || 'TBD'}`, margin + 5, yPosition);
        yPosition += 7;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text('Reminder:', margin + 5, yPosition);
        yPosition += 7;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`Title: ${item.reminderTitle}`, margin + 10, yPosition);
        yPosition += 7;
        
        if (item.reminderNote) {
          doc.text(`Note: ${item.reminderNote}`, margin + 10, yPosition);
          yPosition += 7;
        }
        
        const reminderDate = new Date(item.reminderDate);
        const reminderDateStr = reminderDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        doc.text(`Reminder Date: ${reminderDateStr}`, margin + 10, yPosition);
        yPosition += 15;
      });

      // Generate PDF as blob
      const pdfBlob = doc.output('blob');
      const fileName = `football-reminders-${new Date().toISOString().split('T')[0]}.pdf`;

      // Detect iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);

      if (isIOS) {
        const newBlob = new Blob([pdfBlob], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(newBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        
        setTimeout(() => {
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 100);
        }, 100);
      } else if (isAndroid) {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      setNotification({
        show: true,
        message: `Downloaded ${reminders.length} reminders as PDF!`,
        type: 'success'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 3000);

    } catch (error) {
      console.error('PDF Export failed:', error);
      setNotification({
        show: true,
        message: 'PDF download failed. Please try again.',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 3000);
    }
  };

  const formatMatchDay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).replace(/(\d+)/, '$1');
  };

  const formatMatchTime = (timeStr: string) => {
    if (!timeStr) return 'TBD';
    return timeStr.substring(0, 5);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to group matches by date
  const groupMatchesByDate = (matches: Match[]) => {
    return matches.reduce((groups: { [key: string]: Match[] }, match) => {
      const date = match.dateEvent;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(match);
      return groups;
    }, {});
  };

  // Helper function to format date headers
  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).replace(/,/g, '');
  };

  const isLoading = leagueMatches.some(league => league.loading) || isLoadingReminders;
  const selectedLeague = leagueMatches.find(league => league.leagueId === selectedLeagueId);

  if (isLoading && !leagueMatches.some(l => l.matches.length > 0)) {
    return (
      <div className="bg-[#1a1d23] rounded-xl p-4 sm:p-8 border border-gray-800">
        <div className="flex justify-center items-center py-8 sm:py-12">
          <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-4 border-gray-600 border-t-blue-500"></div>
          <p className="text-gray-400 ml-2 sm:ml-3 text-sm sm:text-base">Loading upcoming matches...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-7">
      {/* Notification Toast */}
      {notification.show && (
        <div 
          className={`fixed top-2 sm:top-4 right-2 sm:right-4 z-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg transition-all duration-300 text-sm sm:text-base ${
            notification.type === 'success' ? 'bg-green-600' : 
            notification.type === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
          } text-white max-w-[90vw] sm:max-w-md animate-slideIn`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : notification.type === 'warning' ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="flex-1">{notification.message}</span>
            <button
              onClick={() => setNotification({ show: false, message: '', type: 'success' })}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Reminder Popup */}
      {showReminderPopup && selectedMatch && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-100 p-3 sm:p-4">
          <div className="bg-[#1a1d23] rounded-xl border border-gray-800 w-full max-w-[95%] sm:max-w-md mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
              {selectedMatch.reminder ? 'Edit Reminder' : 'Set Reminder'}
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 break-words">
              {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
            </p>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-gray-400 text-xs sm:text-sm mb-1">Reminder Title</label>
                <input
                  type="text"
                  value={reminderForm.title}
                  onChange={(e) => setReminderForm({...reminderForm, title: e.target.value})}
                  className="w-full bg-[#252a33] text-white rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Don't miss the match!"
                  disabled={isSaving}
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-xs sm:text-sm mb-1">Note (Optional)</label>
                <textarea
                  value={reminderForm.note}
                  onChange={(e) => setReminderForm({...reminderForm, note: e.target.value})}
                  className="w-full bg-[#252a33] text-white rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="Add any notes..."
                  rows={3}
                  disabled={isSaving}
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-xs sm:text-sm mb-1">Reminder Date</label>
                <input
                  type="date"
                  value={reminderForm.reminderDate}
                  onChange={(e) => {
                    setReminderForm({...reminderForm, reminderDate: e.target.value});
                    setDateError('');
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  max={selectedMatch.gameDate}
                  className="w-full bg-[#252a33] text-white rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-700 focus:outline-none focus:border-blue-500"
                  disabled={isSaving}
                />
                {dateError && (
                  <p className="text-red-400 text-xs mt-1">{dateError}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Match date: {formatMatchDay(selectedMatch.gameDate)}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-5 sm:mt-6">
              <button
                onClick={saveReminder}
                disabled={isSaving}
                className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Reminder'
                )}
              </button>
              <button
                onClick={() => {
                  setShowReminderPopup(false);
                  setSelectedMatch(null);
                  setDateError('');
                }}
                disabled={isSaving}
                className="w-full sm:flex-1 bg-[#252a33] text-white py-2 sm:py-2.5 rounded-lg hover:bg-[#2f3540] transition-colors text-sm sm:text-base disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Watchlist Sidebar */}
      {showWatchlist && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 sm:hidden"
            onClick={() => setShowWatchlist(false)}
          />
          <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-[#1a1d23] border-l border-gray-800 shadow-2xl z-50 overflow-y-auto transition-transform duration-300 ${
            showWatchlist ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="p-4 sm:p-4 pt-12 sm:pt-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-lg font-semibold text-white">My Reminders</h3>
                <button 
                  onClick={() => setShowWatchlist(false)}
                  className="text-gray-400 hover:text-white p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Export PDF Button */}
              {reminders.length > 0 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    exportRemindersToPDF();
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    exportRemindersToPDF();
                  }}
                  className="w-full mb-4 bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 sm:py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-base font-medium active:scale-98 touch-manipulation cursor-pointer"
                  style={{ 
                    minHeight: '48px', 
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none'
                  }}
                >
                  <svg className="w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download PDF Reminders</span>
                </button>
              )}
              
              {reminders.length === 0 ? (
                <p className="text-gray-400 text-center py-8 text-sm">No reminders yet. Click the + button on any match to create one!</p>
              ) : (
                <div className="space-y-3">
                  {reminders.sort((a, b) => new Date(b.reminderDate).getTime() - new Date(a.reminderDate).getTime()).map(item => (
                    <div key={item.id} className="bg-[#252a33] rounded-lg p-3 border border-gray-800">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-blue-400">{item.league}</span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => openReminderPopup(item)}
                            className="text-blue-400 hover:text-blue-300 p-2 sm:p-1.5 touch-manipulation"
                            title="Edit reminder"
                            style={{ minHeight: '44px', minWidth: '44px', WebkitTapHighlightColor: 'transparent' }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => removeFromWatchlist(item.matchId)}
                            className="text-red-400 hover:text-red-300 p-2 sm:p-1.5 touch-manipulation"
                            title="Remove reminder"
                            style={{ minHeight: '44px', minWidth: '44px', WebkitTapHighlightColor: 'transparent' }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-white text-sm font-medium break-words">{item.homeTeam} vs {item.awayTeam}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {formatMatchDay(item.gameDate)} • {item.gameTime}
                      </p>
                      
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <div className="flex items-center gap-1 text-yellow-500">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-medium">{item.reminderTitle}</span>
                        </div>
                        {item.reminderNote && (
                          <p className="text-gray-400 text-xs mt-1 break-words">{item.reminderNote}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">
                          Reminder: {formatDate(item.reminderDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Plus Icon in Bottom Right Corner */}
      <button
        onClick={() => setShowWatchlist(!showWatchlist)}
        className="fixed bottom-4 right-2 sm:right-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 touch-manipulation"
        title="View Reminders"
        style={{ minHeight: '48px', minWidth: '48px', WebkitTapHighlightColor: 'transparent' }}
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        {reminders.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center">
            {reminders.length}
          </span>
        )}
      </button>

      <div className="text-center mb-6 sm:mb-8">
        <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 text-[#9fb7c9] uppercase tracking-widest text-xs sm:text-sm font-medium mb-1">
          <span>never miss a game</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-tight max-w-4xl mx-auto px-2">
          Upcoming <span className="font-semibold text-white bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-transparent bg-clip-text">Fixtures</span>
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-[#b0b8c0] mt-2 sm:mt-3 max-w-xl mx-auto px-2">
          Select a league to view upcoming matches
        </p>
      </div>

      {/* League Navigation */}
      <div className="flex justify-center items-center mb-6 sm:mb-8 w-full px-2">
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center bg-[#1a1d23]/80 backdrop-blur-sm p-2 rounded-xl border border-gray-800 w-full max-w-3xl">
          {leagueMatches.map((league) => (
            <button
              key={league.leagueId}
              onClick={() => {
                setSelectedLeagueId(league.leagueId);
                if (league.matches.length === 0 && !league.loading) {
                  fetchMatchesForLeague(league.leagueId);
                }
              }}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm active:scale-95 touch-manipulation ${
                selectedLeagueId === league.leagueId
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-gray-400 hover:bg-[#252a33] hover:text-white'
              }`}
              style={{ minHeight: '44px', WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="w-5 h-5 sm:w-5 sm:h-5 relative flex-shrink-0">
                <Image 
                  src={league.leagueLogo}
                  alt={league.leagueName}
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
              <span className="font-medium truncate max-w-[70px] sm:max-w-none">{league.leagueName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected League Display with Date-Categorized Matches */}
      {selectedLeague && (
        <div className="max-w-3xl mx-auto px-2 sm:px-0">
          <div 
            className="bg-[#1a1d23] rounded-xl border border-[#2d333d] overflow-hidden hover:border-gray-600 transition-all duration-300"
          >
            <div className="px-3 sm:px-5 py-3 sm:py-4 flex items-center justify-between border-b border-[#262b33]">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 relative flex-shrink-0">
                  <Image 
                    src={selectedLeague.leagueLogo}
                    alt={selectedLeague.leagueName}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white truncate max-w-[120px] sm:max-w-none">
                  {selectedLeague.leagueName}
                </h3>
              </div>
            </div>

            <div className="p-2 sm:p-4">
              {selectedLeague.matches.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {Object.entries(groupMatchesByDate(selectedLeague.matches))
                    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                    .map(([date, matches]) => (
                      <div key={date} className="space-y-2 sm:space-y-3">
                        {/* Date Header */}
                        <div className="flex items-center gap-3 mb-2 sm:mb-3">
                          <h4 className="text-sm sm:text-base font-semibold text-white">
                            {formatDateHeader(date)}
                          </h4>
                          <div className="h-px flex-1 bg-gradient-to-r from-blue-500/30 to-transparent"></div>
                        </div>
                        
                        {/* Matches for this date */}
                        {matches.map((match) => {
                          const reminder = reminders.find(r => r.matchId === match.idEvent);
                          const hasReminder = !!reminder;
                          
                          return (
                            <div key={match.idEvent} className="p-3 sm:p-4 rounded-lg bg-[#252a33] hover:bg-[#2f3540] transition-all duration-300 border border-[#2d333d] hover:border-gray-600 relative">
                              
                              {/* Reminder Badge if set - positioned above the card */}
                              {hasReminder && (
                                <div className="absolute -top-2 left-4 bg-yellow-500/20 text-yellow-500 text-[10px] sm:text-xs px-2 py-0.5 rounded-full flex items-center gap-1 z-10 shadow-lg backdrop-blur-sm border border-yellow-500/30">
                                  <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  <span className="font-medium">Reminder set</span>
                                </div>
                              )}
                              
                              {/* Reminder Button */}
                              <button
                                onClick={() => addToWatchlist(match)}
                                className={`
                                  absolute top-1 right-3 
                                  w-7 h-7 sm:w-8 sm:h-8 
                                  rounded-lg 
                                  transition-all duration-300 
                                  flex items-center justify-center
                                  border-2
                                  shadow-lg
                                  ${hasReminder 
                                    ? 'bg-green-500 border-green-600 text-white hover:bg-green-600' 
                                    : 'bg-[#2d333d] border-gray-600 text-gray-300 hover:bg-[#3a414a] hover:border-gray-500'
                                  }
                                `}
                                title={hasReminder 
                                  ? 'Edit reminder' 
                                  : user 
                                    ? 'Add reminder' 
                                    : 'Sign in to add reminder'
                                }
                                style={{ 
                                  WebkitTapHighlightColor: 'transparent',
                                }}
                              >
                                <svg 
                                  className="w-4 h-4 sm:w-5 sm:h-5" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  {hasReminder ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                  )}
                                </svg>
                              </button>
                              
                              {/* Match Week */}
                              <div className="text-[10px] sm:text-xs text-[#95a5b8] mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
                                <span className="font-medium text-gray-300">
                                  MW {match.intRound || 'TBD'}
                                </span>
                              </div>

                              {/* Main match content with teams and time */}
                              <div className="flex items-center justify-between mb-2 sm:mb-3">
                                {/* Home Team */}
                                <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                                  {match.strHomeTeamBadge && (
                                    <img 
                                      src={match.strHomeTeamBadge} 
                                      alt={match.strHomeTeam}
                                      className="w-4 h-4 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                                      onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                    />
                                  )}
                                  <span className="font-semibold text-white text-xs sm:text-sm md:text-base truncate">
                                    {match.strHomeTeam}
                                  </span>
                                </div>

                                {/* Match Time - centered */}
                                <div className="px-1 sm:px-3 flex-shrink-0">
                                  <span className="text-[10px] sm:text-xs font-bold text-blue-400 bg-blue-400/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                                    {formatMatchTime(match.strTime)}
                                  </span>
                                </div>

                                {/* Away Team */}
                                <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 justify-end">
                                  <span className="font-semibold text-white text-xs sm:text-sm md:text-base truncate">
                                    {match.strAwayTeam}
                                  </span>
                                  {match.strAwayTeamBadge && (
                                    <img 
                                      src={match.strAwayTeamBadge} 
                                      alt={match.strAwayTeam}
                                      className="w-4 h-4 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                                      onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                    />
                                  )}
                                </div>
                              </div>

                              {/* Bottom section with venue and season */}
                              <div className="flex items-center justify-between text-[10px] sm:text-xs border-t border-[#262b33] pt-2 sm:pt-3">
                                <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                                  <span className="text-[#95a5b8] truncate text-[10px] sm:text-xs">
                                    {match.strVenue || 'Venue TBD'}
                                  </span>
                                </div>
                                <span className="text-[#95a5b8] text-[10px] sm:text-xs bg-[#20262e] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0 ml-1">
                                  {match.strSeason}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-[#95a5b8] text-xs sm:text-sm py-3 sm:py-4 text-center">
                  No upcoming matches for this league
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Show message if no league selected or no matches */}
      {!selectedLeague && (
        <div className="text-center py-8 sm:py-12 bg-[#1a1d23] rounded-xl border border-gray-800 mx-2 sm:mx-0">
          <p className="text-gray-400 text-sm sm:text-base">Select a league to view upcoming matches</p>
        </div>
      )}
    </section>
  );
}