import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import { i18n } from '../shared/i18n';
import { HomeScreen } from '../features/home/screens/HomeScreen';

export function App() {
    const isDarkMode = useColorScheme() === 'dark';

    return (
        <I18nextProvider i18n={i18n}>
            <SafeAreaProvider>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
                <HomeScreen />
            </SafeAreaProvider>
        </I18nextProvider>
    );
}
