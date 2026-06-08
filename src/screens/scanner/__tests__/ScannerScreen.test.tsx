import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ScannerScreen from '../ScannerScreen';
import { useScanner } from '@/viewmodels/useScanner';
import { useCameraPermissions } from 'expo-camera';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o?.value !== undefined ? `${k} ${o.value}` : k),
  }),
}));

jest.mock('@/../assets/logos/changuiapp-logo.svg', () => 'ChanguiAppLogo');

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children }: any) => <Text>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text> };
});

jest.mock('expo-camera', () => ({
  CameraView: (props: any) => {
    const { View } = require('react-native');
    return <View testID="camera-view" {...props} />;
  },
  useCameraPermissions: jest.fn(),
}));

jest.mock('@/viewmodels/useScanner', () => ({
  useScanner: jest.fn(),
}));

const mockedUseScanner = jest.mocked(useScanner);
const mockedUsePermissions = jest.mocked(useCameraPermissions);

const handleBarcodeScanned = jest.fn();
const resetScanner = jest.fn();
const clearError = jest.fn();

const buildScannerState = (overrides: Partial<ReturnType<typeof useScanner>> = {}) => ({
  scanned: false,
  loading: false,
  errorMessage: null,
  handleBarcodeScanned,
  resetScanner,
  clearError,
  ...overrides,
});

const setPermission = (permission: any, request: jest.Mock = jest.fn()) => {
  mockedUsePermissions.mockReturnValue([permission, request, jest.fn()] as any);
};

describe('ScannerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseScanner.mockReturnValue(buildScannerState() as any);
    setPermission({ granted: true });
  });

  it('permiso aun no resuelto (null): renderiza una vista vacia sin camara', () => {
    setPermission(null);
    const { queryByTestId } = render(<ScannerScreen />);
    expect(queryByTestId('camera-view')).toBeNull();
  });

  it('permiso denegado: muestra titulo, mensaje y boton para pedir permiso', () => {
    const requestPermission = jest.fn();
    setPermission({ granted: false }, requestPermission);

    const { getByText, queryByTestId } = render(<ScannerScreen />);

    expect(getByText('scanner.permission.title')).toBeTruthy();
    expect(getByText('scanner.permission.message')).toBeTruthy();
    expect(queryByTestId('camera-view')).toBeNull();

    fireEvent.press(getByText('scanner.permission.allow'));
    expect(requestPermission).toHaveBeenCalledTimes(1);
  });

  it('permiso concedido: renderiza la camara y conecta onBarcodeScanned con el handler', () => {
    const { getByTestId } = render(<ScannerScreen />);

    const camera = getByTestId('camera-view');
    expect(camera.props.onBarcodeScanned).toBe(handleBarcodeScanned);

    camera.props.onBarcodeScanned({ data: '7790001' });
    expect(handleBarcodeScanned).toHaveBeenCalledWith({ data: '7790001' });
  });

  it('cuando ya escaneo: deshabilita onBarcodeScanned y muestra el boton de re-escaneo', () => {
    mockedUseScanner.mockReturnValue(buildScannerState({ scanned: true }) as any);

    const { getByTestId, getByText } = render(<ScannerScreen />);

    expect(getByTestId('camera-view').props.onBarcodeScanned).toBeUndefined();

    fireEvent.press(getByText('scanner.scanAgain'));
    expect(resetScanner).toHaveBeenCalledTimes(1);
  });

  it('no muestra el boton de re-escaneo mientras no haya escaneado', () => {
    const { queryByText } = render(<ScannerScreen />);
    expect(queryByText('scanner.scanAgain')).toBeNull();
  });

  it('con errorMessage: muestra el banner de error y permite cerrarlo', () => {
    mockedUseScanner.mockReturnValue(
      buildScannerState({ errorMessage: 'network timeout' }) as any,
    );

    const { getByText, getByRole } = render(<ScannerScreen />);

    expect(getByText('network timeout')).toBeTruthy();
    fireEvent.press(getByRole('button'));
    expect(clearError).toHaveBeenCalledTimes(1);
  });

  it('sin error: no renderiza el banner de error', () => {
    const { queryByRole } = render(<ScannerScreen />);
    expect(queryByRole('alert')).toBeNull();
  });

  it('loading: monta el overlay de carga', () => {
    mockedUseScanner.mockReturnValue(
      buildScannerState({ scanned: true, loading: true }) as any,
    );

    const { UNSAFE_getAllByType } = render(<ScannerScreen />);

    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
  });

  it('loading deshabilita el boton de re-escaneo', () => {
    mockedUseScanner.mockReturnValue(
      buildScannerState({ scanned: true, loading: true }) as any,
    );

    const { getByText } = render(<ScannerScreen />);
    fireEvent.press(getByText('scanner.scanAgain'));
    expect(resetScanner).not.toHaveBeenCalled();
  });
});
