import ReactTestRenderer from 'react-test-renderer';
import { App } from '../src/app/App';

test('renders the app', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(<App />);
    });
    expect(renderer?.toJSON()).not.toBeNull();
});
