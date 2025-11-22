import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Tabs from './Tabs';
import Login from '../screens/Login';
import HistoryTransaction from '../components/HistoryTransaction';
import HistoryLocation from '../components/HistoryLocation';

const Stack = createNativeStackNavigator();

export default function Navigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="History" component={HistoryTransaction} />
                <Stack.Screen name="HistoryChangeLocation" component={HistoryLocation} />
                <Stack.Screen name="Tabs" component={Tabs} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
