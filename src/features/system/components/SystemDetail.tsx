import { useSystemDetail } from '../hooks/useSystemDetail';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatBytes } from '@/lib/format';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SystemDetail = () => {
    const { data, loading, error, refetch } = useSystemDetail();

    if (loading && !data) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center space-y-4">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Loading detailed system information...</p>
                    <p className="text-xs text-muted-foreground/50">This may take a few seconds</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center text-red-500 space-y-4">
                    <p>Error loading system info: {error}</p>
                    <Button onClick={refetch} variant="outline">Retry</Button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-1">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Detailed System Information</h2>
                <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* OS Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Operating System</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                            <span className="text-muted-foreground">OS Name</span>
                            <span className="font-medium text-right">{data.osName}</span>

                            <span className="text-muted-foreground">Version</span>
                            <span className="font-medium text-right">{data.osVersion}</span>

                            <span className="text-muted-foreground">Build</span>
                            <span className="font-medium text-right">{data.osBuild}</span>

                            <span className="text-muted-foreground">Architecture</span>
                            <span className="font-medium text-right">{data.osArchitecture}</span>

                            <span className="text-muted-foreground">Manufacturer</span>
                            <span className="font-medium text-right">{data.osManufacturer}</span>

                            <span className="text-muted-foreground">Time Zone</span>
                            <span className="font-medium text-right">{data.timeZone}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Hardware Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hardware</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                            <span className="text-muted-foreground">System Manufacturer</span>
                            <span className="font-medium text-right">{data.systemManufacturer}</span>

                            <span className="text-muted-foreground">System Model</span>
                            <span className="font-medium text-right">{data.systemModel}</span>

                            <span className="text-muted-foreground">BIOS Manufacturer</span>
                            <span className="font-medium text-right">{data.biosManufacturer}</span>

                            <span className="text-muted-foreground">BIOS Version</span>
                            <span className="font-medium text-right">{data.biosVersion}</span>

                            <span className="text-muted-foreground">Total Memory</span>
                            <span className="font-medium text-right">{formatBytes(data.totalMemory)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Network Adapters */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Network Adapters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {data.networkAdapters.map((adapter, i) => (
                                <div key={i} className="p-4 border rounded-lg bg-card/50 flex flex-col justify-between hover:bg-card transition-colors">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold truncate pr-2" title={adapter.name}>{adapter.name}</span>
                                            <Badge variant={adapter.status === 'Up' ? 'default' : 'secondary'} className="shrink-0">
                                                {adapter.status}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2" title={adapter.description}>
                                            {adapter.description}
                                        </p>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-border/50">
                                        <p className="text-xs font-mono text-muted-foreground flex justify-between">
                                            <span>MAC:</span>
                                            <span>{adapter.macAddress}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Hotfixes */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Hotfixes
                            <Badge variant="secondary" className="rounded-full">{data.hotfixes.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
                            {data.hotfixes.length > 0 ? (
                                data.hotfixes.map((fix, i) => (
                                    <Badge key={i} variant="outline" className="font-mono bg-background/50 hover:bg-background">
                                        {fix}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-muted-foreground text-sm">No hotfix information available</span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
