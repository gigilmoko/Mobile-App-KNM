import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  FlatList, 
  Dimensions, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvent } from '../../redux/actions/calendarActions';
import { loadUser } from '../../redux/actions/userActions';
import { fetchEventFeedbackMobile } from '../../redux/actions/eventFeedbackActions';
import { getUserInterest, expressInterest } from '../../redux/actions/userInterestActions';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import Footer from '../../components/Layout/Footer';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const EventInfo = ({ route }) => {
  const { eventId } = route.params;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isRegistering, setIsRegistering] = useState(false);

  const { event, loading, error } = useSelector(state => state.calendar);
  const { user, isAuthenticated } = useSelector(state => state.user);
  const { eventFeedback, loadingFeedback } = useSelector(state => state.eventFeedback || {});
  const { interestData, loadingInterest } = useSelector(state => state.userInterested || {});

  const attendedUsers = interestData?.attendedUsers || [];
  const interestedUsers = interestData?.interestedUsers || [];

  // Check if current user is registered for this event
  const userRegistered = interestedUsers.some(u => u.userId === user?._id && u.interested);
  const userAttended = attendedUsers.some(u => u.userId === user?._id && u.isAttended);

  useEffect(() => {
    dispatch(fetchEvent(eventId));
    dispatch(fetchEventFeedbackMobile(eventId));
    
    if (isAuthenticated && user?._id) {
      dispatch(getUserInterest(eventId));
    }
  }, [eventId, dispatch, isAuthenticated, user?._id]);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to fetch event',
        text2: error,
      });
    }
  }, [error]);

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Check if the event is past
  const isEventPast = event ? moment(event.endDate).isBefore(moment()) : false;
  
  // Check if event is currently occurring
  const isEventOngoing = event ? 
    moment().isBetween(moment(event.startDate), moment(event.endDate)) : false;

  const handleRating = () => {
    navigation.navigate('eventfeedback', { eventId });
  };

  // Define the button text based on registration and attendance status
  const getButtonText = () => {
    if (isEventOngoing) return "Event In Progress";
    
    if (!isEventPast) {
      return userRegistered ? "Already Registered" : "Register Now";
    }
    
    if (!userRegistered) {
      return "Registration Closed";
    } else if (userRegistered && !userAttended) {
      return "You registered but did not attend";
    } else if (userRegistered && userAttended) {
      return "Rate this Event";
    }
    
    return "Event Completed";
  };

  const getButtonClass = () => {
    if (!isEventPast && !userRegistered) return "bg-[#e01d47]";
    if (!isEventPast && userRegistered) return "bg-green-500";
    if (userRegistered && userAttended && isEventPast) return "bg-[#e01d47]";
    if (isEventOngoing) return "bg-amber-500";
    return "bg-gray-400";
  };

  // Update the handleRegister function
const handleRegister = async () => {
  if (!isAuthenticated) {
    Alert.alert(
      "Login Required",
      "Please login to register for this event",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => navigation.navigate("login") }
      ]
    );
    return;
  }

  if (userRegistered) {
    Toast.show({
      type: 'info',
      text1: 'Already Registered',
      text2: 'You are already registered for this event',
    });
    return;
  }

  setIsRegistering(true);
  try {
    const result = await dispatch(expressInterest(eventId));
    
    if (result && !result.success && result.message?.includes("already interested")) {
      Toast.show({
        type: 'info',
        text1: 'Already Registered',
        text2: 'You are already registered for this event',
      });
      // Refresh the user interest data to update UI
      dispatch(getUserInterest(eventId));
    } else {
      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'You have successfully registered for this event',
      });
    }
  } catch (error) {
    if (error.response?.data?.message?.includes("already interested")) {
      Toast.show({
        type: 'info',
        text1: 'Already Registered',
        text2: 'You are already registered for this event',
      });
      // Refresh the user interest data to update UI
      dispatch(getUserInterest(eventId));
    } else {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.message || 'Please try again later',
      });
    }
  } finally {
    setIsRegistering(false);
  }
};

  const renderEventStatus = () => {
    if (isEventOngoing) {
      return (
        <View className="bg-amber-500 py-1.5 px-3 rounded-full">
          <Text className="text-white font-medium text-sm">Live Now</Text>
        </View>
      );
    }
    
    if (isEventPast) {
      return (
        <View className="bg-gray-500 py-1.5 px-3 rounded-full">
          <Text className="text-white font-medium text-sm">Past Event</Text>
        </View>
      );
    }
    
    return (
      <View className="bg-green-500 py-1.5 px-3 rounded-full">
        <Text className="text-white font-medium text-sm">Upcoming</Text>
      </View>
    );
  };

  const renderReviewItem = ({ item }) => (
    <View className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-100">
      <View className="flex-row items-start">
        {item.userId?.avatar ? (
          <Image
            source={{ uri: item.userId.avatar }}
            className="w-12 h-12 rounded-full mr-3"
          />
        ) : (
          <View className="w-12 h-12 bg-[#ff7895] rounded-full items-center justify-center mr-3">
            <Text className="text-white font-bold text-lg">
              {item.userId?.fname?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
        )}

        <View className="flex-1">
          <View className="flex-row justify-between items-center">
            <Text className="font-bold text-gray-800">
              {`${item.userId?.fname || ""} ${item.userId?.lname || ""}`}
            </Text>
            <Text className="text-gray-500 text-xs">
              {moment(item.createdAt).format("MMM D, YYYY")}
            </Text>
          </View>

          <View className="flex-row mt-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= item.rating ? "star" : "star-outline"}
                size={16}
                color="#FFD700"
              />
            ))}
          </View>

          <Text className="text-gray-700">{item.description}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#e01d47" />
        <Text className="text-gray-500 mt-3">Loading event details...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {event ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
          {/* Header with Back Button */}
          <View className="w-full h-80 relative">
            {event.image ? (
              <Image
                source={{ uri: event.image }}
                className="w-full h-full"
                style={{ resizeMode: 'cover' }}
              />
            ) : (
              <View className="w-full h-full justify-center items-center bg-gray-200">
                <Ionicons name="calendar" size={80} color="#e0e0e0" />
                <Text className="text-gray-500 mt-4">No image available</Text>
              </View>
            )}
            
            {/* Overlay for better text readability */}
            <View className="absolute bottom-0 left-0 right-0 h-24 bg-black opacity-40" />
            
            {/* Back button and status */}
            <View className="absolute top-10 left-5 right-5 z-10 flex-row justify-between items-center">
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                className="p-2.5 bg-black/30 rounded-full shadow items-center justify-center w-10 h-10"
              >
                <Ionicons name="arrow-back" size={22} color="white" />
              </TouchableOpacity>
              
              {/* Event Status Indicator */}
              {renderEventStatus()}
            </View>
            
            {/* Event title on image */}
            <View className="absolute bottom-0 left-0 right-0 p-5">
              <Text className="text-3xl font-bold text-white">{event.title}</Text>
            </View>
          </View>
          
          {/* Event Info Card */}
          <View className="p-5">
            <View className="flex-row items-center bg-white shadow-sm p-3 rounded-xl mb-4 border border-gray-100">
              <View className="flex-1 flex-row items-center">
                <View className="bg-red-50 rounded-full p-2 mr-3">
                  <Ionicons name="calendar-outline" size={20} color="#e01d47" />
                </View>
                <View>
                  <Text className="text-xs text-gray-500">Date</Text>
                  <Text className="text-base font-medium text-gray-800">
                    {moment(event.startDate).format("MMM D, YYYY")}
                  </Text>
                </View>
              </View>
              
              <View className="w-[1px] h-10 bg-gray-200 mx-2" />
              
              <View className="flex-1 flex-row items-center">
                <View className="bg-blue-50 rounded-full p-2 mr-3">
                  <Ionicons name="time-outline" size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text className="text-xs text-gray-500">Time</Text>
                  <Text className="text-base font-medium text-gray-800">
                    {moment(event.startDate).format("h:mm A")}
                  </Text>
                </View>
              </View>
            </View>
            
            {event.location && (
              <View className="flex-row items-center mb-6">
                <View className="bg-green-50 rounded-full p-2 mr-3">
                  <Ionicons name="location-outline" size={20} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Location</Text>
                  <Text className="text-base font-medium text-gray-800">{event.location}</Text>
                </View>
              </View>
            )}
            
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-800 mb-3">About this Event</Text>
              <Text className="text-gray-700 leading-6">{event.description}</Text>
            </View>
            
            {/* Registration Status */}
            {userRegistered && !isEventPast && (
              <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex-row items-center">
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text className="text-green-700 font-medium ml-2">You're registered for this event</Text>
              </View>
            )}
            
            {/* Conditional Button */}
            <TouchableOpacity
              onPress={(!isEventPast && !userRegistered) ? handleRegister : 
                      (userRegistered && userAttended && isEventPast) ? handleRating : null}
              disabled={(isEventPast && (!userRegistered || !userAttended)) || isEventOngoing || isRegistering}
              className={`py-4 rounded-xl items-center mb-6 ${getButtonClass()}`}
            >
              {isRegistering ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="font-bold text-white text-base">
                  {getButtonText()}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Attendee Stats */}
          {interestedUsers.length > 0 && (
            <View className="bg-white mx-5 rounded-xl shadow-sm p-5 border border-gray-100 mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-800">Attendees</Text>
                <View className="bg-blue-50 px-3 py-1 rounded-full">
                  <Text className="text-blue-700 font-medium">{interestedUsers.length} registered</Text>
                </View>
              </View>
              
              <View className="flex-row">
                <View className="bg-[#fce8ec] p-4 rounded-xl flex-1 mr-2">
                  <Text className="text-center text-[#e01d47] font-bold text-lg">
                    {attendedUsers.length}
                  </Text>
                  <Text className="text-center text-[#e01d47] text-xs">Attended</Text>
                </View>
                
                <View className="bg-gray-100 p-4 rounded-xl flex-1 ml-2">
                  <Text className="text-center text-gray-700 font-bold text-lg">
                    {interestedUsers.length - attendedUsers.length}
                  </Text>
                  <Text className="text-center text-gray-700 text-xs">Did not attend</Text>
                </View>
              </View>
            </View>
          )}
          
          {/* Reviews Section */}
          {isEventPast && eventFeedback && eventFeedback.length > 0 && (
            <View className="mx-5 mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-800">Reviews</Text>
                <View className="bg-yellow-50 px-3 py-1 rounded-full">
                  <Text className="text-yellow-700 font-medium">{eventFeedback.length} reviews</Text>
                </View>
              </View>
              
              <FlatList
                data={eventFeedback}
                keyExtractor={(item) => item._id}
                renderItem={renderReviewItem}
                scrollEnabled={false}
              />
            </View>
          )}
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center p-5">
          <Ionicons name="alert-circle-outline" size={70} color="#e0e0e0" />
          <Text className="text-xl text-gray-500 mt-4 text-center font-medium">Event not found</Text>
          <Text className="text-gray-400 text-center mt-2 mb-6">The event you're looking for may have been removed or is no longer available.</Text>
          <TouchableOpacity 
            className="bg-[#e01d47] py-3 px-6 rounded-full flex-row items-center"
            onPress={() => navigation.navigate('eventlist')}
          >
            <Ionicons name="calendar-outline" size={20} color="white" />
            <Text className="text-white font-bold ml-2">View All Events</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Footer */}
      {/* <View className="absolute bottom-0 w-full">
        <Footer activeRoute={"eventInfo"} />
      </View> */}
    </View>
  );
};

export default EventInfo;