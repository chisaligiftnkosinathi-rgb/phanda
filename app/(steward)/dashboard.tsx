import { Redirect } from 'expo-router';

export default function DashboardRedirect() {
    // Legacy support for older deep links
    return <Redirect href="/(steward)/tabs/home" />;
}
