import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    XAxis,
    YAxis,
} from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { VotesRecord, VotesResponse } from "@/types/pocketbase-types";

const chartConfig = {
    votes: {
        label: "Votes",
    },
    "0": {
        label: "0pt / no vote",
        color: "hsl(var(--chart-1))",
    },
    "1": {
        label: "1pt",
        color: "hsl(var(--chart-1))",
    },
    "2": {
        label: "2pts",
        color: "hsl(var(--chart-2))",
    },
    "3": {
        label: "3pts",
        color: "hsl(var(--chart-3))",
    },
    "5": {
        label: "5pts",
        color: "hsl(var(--chart-4))",
    },
    "13": {
        label: "8pts",
        color: "hsl(var(--chart-5))",
    },
} satisfies ChartConfig;

export function ResultsChart({
    votes,
}: {
    votes: VotesResponse<VotesRecord>[];
}) {
    const chartData: {
        score: string;
        votes: number;
        fill: string;
    }[] = [
        { score: "0", votes: 0, fill: "var(--color-0)" },
        { score: "1", votes: 0, fill: "var(--color-1)" },
        { score: "2", votes: 0, fill: "var(--color-2)" },
        { score: "3", votes: 0, fill: "var(--color-3)" },
        { score: "5", votes: 0, fill: "var(--color-5)" },
        { score: "8", votes: 0, fill: "var(--color-8)" },
        { score: "13", votes: 0, fill: "var(--color-13)" },
    ] as const;

    for (const vote of votes) {
        const chartEntry = chartData.findIndex(
            (e) => e.score.toString() === vote.vote
        );

        if (chartEntry === -1) continue;

        chartData[chartEntry].votes += 1;
    }

    // const totalVotes = React.useMemo(() => {
    //     return chartData.reduce((acc, curr) => acc + curr.votes, 0);
    // }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Bar Chart - Custom Label</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={chartData.filter((d) => d.votes > 0)}
                        layout="vertical"
                        margin={{
                            right: 16,
                        }}
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="score"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => `${value}pt`}
                        />
                        <XAxis
                            dataKey="votes"
                            type="number"
                            allowDecimals={false}
                            hide
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Bar
                            dataKey="votes"
                            layout="vertical"
                            fill="var(--color-desktop)"
                            radius={4}
                        >
                            <LabelList
                                dataKey="votes"
                                position="insideRight"
                                offset={8}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
