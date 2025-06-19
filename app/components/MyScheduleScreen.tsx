import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { ScrollView, Text, View } from "react-native";

interface MyScheduleScreenProps {
  currentUser: {
    id: Id<"users">;
    name: string;
    avatarUrl: string;
  };
}

export function MyScheduleScreen({ currentUser }: MyScheduleScreenProps) {
  const shifts = useQuery(api.shifts.getShiftsByEmployee, {
    employeeId: currentUser.id,
  });

  return (
    <ScrollView className="flex-1 bg-zinc-900">
      <View className="p-4 mb-6">
        <View className="flex-row items-center">
          <View className="h-12 w-12 rounded-full overflow-hidden bg-zinc-700 mr-4">
            <Image
              source={{ uri: currentUser.avatarUrl }}
              className="h-full w-full"
              contentFit="cover"
            />
          </View>
          <View>
            <Text className="text-2xl font-bold text-slate-100">
              Мой график
            </Text>
            <Text className="text-slate-400">{currentUser.name}</Text>
          </View>
        </View>
      </View>

      <View className="px-3">
        {!shifts ? (
          <View className="bg-zinc-800 rounded-lg py-10 px-4">
            <Text className="text-slate-400 text-center">Загрузка...</Text>
          </View>
        ) : shifts.length === 0 ? (
          <View className="bg-zinc-800 rounded-lg py-10 px-4">
            <Text className="text-slate-400 text-center">
              У вас нет назначенных смен.
            </Text>
          </View>
        ) : (
          <View className="space-y-4">
            {shifts.map((shift) => (
              <View
                key={shift.id}
                className="bg-gradient-to-br from-blue-600/20 to-zinc-800 border border-blue-500/30 rounded-xl p-4"
              >
                <Text className="text-base font-semibold text-slate-100">
                  {shift.task}
                </Text>
                <Text className="text-sm text-slate-400 mt-1">{shift.day}</Text>
                <View className="flex-row items-center mt-2">
                  <Ionicons name="time-outline" size={16} color="#60a5fa" />
                  <Text className="text-sm text-blue-400 ml-2 font-medium">
                    {shift.startTime} - {shift.endTime}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
