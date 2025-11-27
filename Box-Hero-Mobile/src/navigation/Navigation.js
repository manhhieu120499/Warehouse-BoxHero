import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Tabs from './Tabs';
import Login from '../screens/Login';
import HistoryTransaction from '../components/HistoryTransaction';
import HistoryLocation from '../components/HistoryLocation';
import Product from '../screens/Product';
import Customer from '../screens/Customer';
import Supplier from '../screens/Supplier';
import Employee from '../screens/Employee';
import ProposalRelease from '../screens/ProposalRelease';
import CreateProposalRelease from '../screens/CreateProposalRelease';
import CheckPage from '../screens/CheckPage';
import ProposalPurchase from '../screens/ProposalPurchase';
import CreateProposalPurchase from '../screens/CreateProposalPurchase';
import CreateImport from '../screens/CreateImport';
import CreateImportDetail from '../screens/CreateImportDetail';
import CreateMissingImportDetail from '../screens/CreateMissingImportDetail';
import MissingImport from '../screens/MissingImport';
import OrderReleaseProduct from '../screens/OrderReleaseProduct';
import CreateOrderReleaseProduct from '../screens/CreateOrderReleaseProduct';

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
                <Stack.Screen name="Supplier" component={Supplier} />
                <Stack.Screen name="Staff" component={Employee} />
                <Stack.Screen name="ExportRequest" component={ProposalRelease} />
                <Stack.Screen name="CreateExportRequest" component={CreateProposalRelease} />
                <Stack.Screen name="Inventory" component={CheckPage} />
                <Stack.Screen name="ImportRequest" component={ProposalPurchase} />
                <Stack.Screen name="CreateImportRequest" component={CreateProposalPurchase} />
                <Stack.Screen name="CreateImport" component={CreateImport} />
                <Stack.Screen name="CreateImportDetail" component={CreateImportDetail} />
                <Stack.Screen name="CreateMissingImportDetail" component={CreateMissingImportDetail} />
                <Stack.Screen name="MissingImport" component={MissingImport} />
                <Stack.Screen name="CreateExport" component={OrderReleaseProduct} />
                <Stack.Screen name="CreateOrderRelease" component={CreateOrderReleaseProduct} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
