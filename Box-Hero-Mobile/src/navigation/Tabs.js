import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Home from '../screens/Home';
import { Entypo, Feather, FontAwesome5 } from '@expo/vector-icons';
import Shelf from '../screens/Shelf';
import Notification from '../screens/Notification';
import Profile from '../screens/Profile';
import { TouchableOpacity } from 'react-native';
import { View } from 'react-native';
import BatchPage from '../screens/BatchPage';

const Tab = createBottomTabNavigator();

const screenOptions = ({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: '#096aec',
    tabBarInactiveTintColor: '#8d8d8d',
    tabBarStyle: {
        backgroundColor: 'white',
        borderTopColor: '#e7e7e7',
    },
    tabBarButton: (props) => {
        const { accessibilityState, children, onPress } = props;
        const focused = accessibilityState?.selected;

        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={1}
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: 7,
                }}
            >
                <View
                    style={{
                        width: '50%',
                        borderTopWidth: 2,
                        borderTopColor: focused ? '#096aec' : 'transparent',
                        alignSelf: 'center',
                        position: 'absolute',
                        top: 0,
                        borderRadius: 2,
                    }}
                />
                {children}
            </TouchableOpacity>
        );
    },
    tabBarIcon: ({ focused }) => {
        const tabs = {
            Home: {
                icon: <FontAwesome5 solid name="home" color={focused ? '#096aec' : 'gray'} size={20} />,
            },
            Shelf: {
                icon: <FontAwesome5 solid name="box" color={focused ? '#096aec' : 'gray'} size={20} />,
            },
            Notification: {
                icon: <FontAwesome5 solid name="bell" color={focused ? '#096aec' : 'gray'} size={20} />,
            },
            Profile: {
                icon: <FontAwesome5 solid name="user-alt" color={focused ? '#096aec' : 'gray'} size={20} />,
            },
        };
        return tabs[route.name].icon;
    },
});

export default function Tabs() {
    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={screenOptions}>
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarLabel: 'Trang chủ',
                    tabBarLabelStyle: {
                        fontSize: 12,
                    },
                }}
            />
            <Tab.Screen
                name="Shelf"
                component={BatchPage}
                options={{
                    tabBarLabel: 'QL kệ',
                    tabBarLabelStyle: {
                        fontSize: 12,
                    },
                }}
            />
            <Tab.Screen
                name="Notification"
                component={Notification}
                options={{
                    tabBarLabel: 'Thông báo',
                    tabBarLabelStyle: {
                        fontSize: 12,
                    },
                }}
            />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                    tabBarLabel: 'Cá nhân',
                    tabBarLabelStyle: {
                        fontSize: 12,
                    },
                }}
            />
        </Tab.Navigator>
    );
}
