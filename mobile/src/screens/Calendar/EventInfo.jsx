import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  StyleSheet, 
  FlatList, 
  Dimensions, 
  TouchableOpacity,
  ActivityIndicator
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

  const { event, loading, error } = useSelector(state => state.calendar);
  const { user } = useSelector(state => state.auth || {});
  const { eventFeedback, loadingFeedback } = useSelector(state => state.eventFeedback || {});
  const { interestData, loadingInterest } = useSelector(state => state.userInterested || {});

  const attendedUsers = interestData.attendedUsers || [];
  const interestedUsers = interestData.interestedUsers || [];

  useEffect(() => {
    dispatch(fetchEvent(eventId));
    dispatch(fetchEventFeedbackMobile(eventId));
    dispatch(loadUser());
    dispatch(getUserInterest(eventId));
  }, [eventId, dispatch]);

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

  const userRegistered = interestedUsers.some(user => user.email === user?.email && user.interested);
  const userAttended = attendedUsers.some(user => user.email === user?.email && user.isAttended);

  // Define the button text based on registration and attendance status
  const getButtonText = () => {
    if (isEventOngoing) return "Event In Progress";
    
    if (!isEventPast) return "Register Now";
    
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
    if (userRegistered && userAttended && isEventPast) return "bg-[#e01d47]";
    if (isEventOngoing) return "bg-amber-500";
    return "bg-gray-400";
  };

  const handleRegister = () => {
    dispatch(expressInterest(eventId));
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
              {new Date(item.createdAt).toLocaleDateString()}
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
        <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
          {/* Header with Back Button */}
          <View className="absolute top-5 left-5 right-5 z-10 flex-row items-center py-3">
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              className="p-2 bg-white bg-opacity-80 rounded-full shadow items-center justify-center w-10 h-10"
            >
              <Ionicons name="arrow-back" size={22} color="#e01d47" />
            </TouchableOpacity>
            
            <View className="flex-1" />
            
            {/* Event Status Indicator */}
            {renderEventStatus()}
          </View>
          
          {/* Event Image */}
          <View className="w-full h-72 bg-gray-200">
            {event.image ? (
              <Image
                source={{ uri: event.image }}
                className="w-full h-full"
                style={{ resizeMode: 'cover' }}
              />
            ) : (
              <View className="w-full h-full justify-center items-center">
                <Ionicons name="calendar" size={80} color="#e0e0e0" />
                <Text className="text-gray-500 mt-4">No image available</Text>
              </View>
            )}
          </View>
          
          {/* Event Info Card */}
          <View className="bg-white mx-4 -mt-10 rounded-xl shadow-lg p-5 border border-gray-100">
            <Text className="text-2xl font-bold text-[#e01d47]">{event.title}</Text>
            
            <View className="flex-row items-center mt-3 justify-between">
              <View className="flex-row items-center flex-1">
                <Ionicons name="calendar-outline" size={18} color="#e01d47" />
                <Text className="text-gray-700 ml-2 font-medium">
                  {formatDateTime(event.startDate).split(' ')[0]}
                </Text>
              </View>
              
              <View className="bg-gray-100 px-3 py-1 rounded-full">
                <Text className="text-gray-700 text-sm">
                  {isEventPast ? 'Completed' : 
                   isEventOngoing ? 'In Progress' : 
                   `In ${moment(event.startDate).diff(moment(), 'days')} days`}
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center mt-2">
              <Ionicons name="time-outline" size={18} color="#e01d47" />
              <Text className="text-gray-700 ml-2">
                {formatDateTime(event.startDate).split(' ')[1]} - {formatDateTime(event.endDate).split(' ')[1]}
              </Text>
            </View>
            
            <View className="flex-row items-center mt-2">
              <Ionicons name="location-outline" size={18} color="#e01d47" />
              <Text className="text-gray-700 ml-2">{event.location}</Text>
            </View>
            
            <View className="border-t border-gray-200 my-4" />
            
            <Text className="text-lg font-bold text-gray-800">About this Event</Text>
            <Text className="text-gray-700 mt-2 leading-6">{event.description}</Text>
            
            {/* Conditional Button */}
            <TouchableOpacity
              onPress={(!isEventPast && !userRegistered) ? handleRegister : 
                      (userRegistered && userAttended && isEventPast) ? handleRating : null}
              disabled={isEventPast && (!userRegistered || !userAttended) || isEventOngoing}
              className={`mt-5 py-3.5 rounded-lg items-center ${getButtonClass()}`}
            >
              <Text className="font-bold text-white text-base">
                {getButtonText()}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Attendee Stats */}
          {interestedUsers.length > 0 && (
            <View className="bg-white mx-4 mt-4 rounded-xl shadow-sm p-4 border border-gray-100">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-bold text-gray-800">Attendees</Text>
                <Text className="text-gray-600">{interestedUsers.length} registered</Text>
              </View>
              
              <View className="flex-row mt-3">
                <View className="bg-[#e01d47] bg-opacity-10 p-3 rounded-lg flex-1 mr-2">
                  <Text className="text-center text-[#e01d47] font-bold text-lg">
                    {attendedUsers.length}
                  </Text>
                  <Text className="text-center text-gray-700 text-xs">Attended</Text>
                </View>
                
                <View className="bg-gray-100 p-3 rounded-lg flex-1 ml-2">
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
            <View className="mx-4 mt-4 mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-bold text-gray-800">Reviews</Text>
                <Text className="text-gray-600">{eventFeedback.length} reviews</Text>
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
        <View className="flex-1 justify-center items-center">
          <Ionicons name="alert-circle-outline" size={70} color="#e0e0e0" />
          <Text className="text-lg text-gray-500 mt-4">Event not found</Text>
          <TouchableOpacity 
            className="mt-6 bg-[#e01d47] py-3 px-6 rounded-full"
            onPress={() => navigation.navigate('eventlist')}
          >
            <Text className="text-white font-medium">View All Events</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Footer */}
      <View className="absolute bottom-0 w-full">
        <Footer activeRoute={"eventInfo"} />
      </View>
    </View>
  );
};

export default EventInfo;