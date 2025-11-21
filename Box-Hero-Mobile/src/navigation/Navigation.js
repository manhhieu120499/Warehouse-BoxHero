import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Tabs from './Tabs';
import Login from '../screens/Login';
import HistoryTransaction from '../components/HistoryTransaction';
import HistoryLocation from '../components/HistoryLocation';
import Product from '../screens/Product';
import Customer from '../screens/Customer';

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
                <Stack.Screen name="Product" component={Product} />
                <Stack.Screen name="Customer" component={Customer} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
