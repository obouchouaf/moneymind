import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme';

interface State {
  hasError: boolean;
  error: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[WealthPilot Error]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A1F', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
            Something went wrong
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
            {this.state.error}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: '' })}
            style={{ backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}
