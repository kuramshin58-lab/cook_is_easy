import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChefHat, ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  baseIngredientsOptions,
  equipmentOptions,
  cuisinePreferencesOptions,
  dietPreferencesOptions
} from "@shared/schema";

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { setUser } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<OnboardingStep>(1);
  const [baseIngredients, setBaseIngredients] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [foodPreferences, setFoodPreferences] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      base_ingredients: string[];
      equipment: string[];
      food_preferences: string[];
    }) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      toast({
        title: "Регистрация успешна!",
        description: "Добро пожаловать в сервис рецептов",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка регистрации",
        description: error.message || "Попробуйте еще раз",
        variant: "destructive",
      });
    },
  });

  const toggleItem = (
    item: string,
    list: string[],
    setList: (items: string[]) => void
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleNext = () => {
    if (step < 5) {
      setStep((s) => (s + 1) as OnboardingStep);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => (s - 1) as OnboardingStep);
    }
  };

  const handleSubmit = () => {
    if (!name || !email || !password) {
      toast({
        title: "Заполните все поля",
        description: "Имя, email и пароль обязательны",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({
      name,
      email,
      password,
      base_ingredients: baseIngredients,
      equipment,
      food_preferences: foodPreferences,
    });
  };

  const progress = (step / 5) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
            <ChefHat className="h-6 w-6 text-primary" />
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">Шаг {step} из 5</p>
        </div>

        <Card>
          {step === 1 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Добро пожаловать!
                </CardTitle>
                <CardDescription className="text-base">
                  Мы поможем вам готовить вкусные блюда из того, что есть дома
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <p className="text-sm">
                    Чтобы подбирать рецепты максимально точно, нам нужно узнать немного о вас:
                  </p>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      Какие базовые продукты у вас всегда есть
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      Какое оборудование для готовки доступно
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      Ваши предпочтения в еде
                    </li>
                  </ul>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Это займет всего пару минут, и мы будем подбирать рецепты специально для вас!
                </p>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Базовые продукты</CardTitle>
                <CardDescription>
                  Что из этого у вас обычно есть дома? Эти продукты мы не будем спрашивать каждый раз
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {baseIngredientsOptions.map((item) => (
                    <Badge
                      key={item}
                      variant={baseIngredients.includes(item) ? "default" : "outline"}
                      className="cursor-pointer text-sm py-1.5 px-3"
                      onClick={() => toggleItem(item, baseIngredients, setBaseIngredients)}
                      data-testid={`badge-ingredient-${item}`}
                    >
                      {baseIngredients.includes(item) && <Check className="h-3 w-3 mr-1" />}
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Оборудование для готовки</CardTitle>
                <CardDescription>
                  Выберите, что у вас есть для приготовления блюд
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {equipmentOptions.map((item) => (
                    <Badge
                      key={item}
                      variant={equipment.includes(item) ? "default" : "outline"}
                      className="cursor-pointer text-sm py-1.5 px-3"
                      onClick={() => toggleItem(item, equipment, setEquipment)}
                      data-testid={`badge-equipment-${item}`}
                    >
                      {equipment.includes(item) && <Check className="h-3 w-3 mr-1" />}
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Предпочтения в еде</CardTitle>
                <CardDescription>
                  Какую кухню и тип питания вы предпочитаете?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Тип кухни</Label>
                  <div className="flex flex-wrap gap-2">
                    {cuisinePreferencesOptions.map((item) => (
                      <Badge
                        key={item}
                        variant={foodPreferences.includes(item) ? "default" : "outline"}
                        className="cursor-pointer text-sm py-1.5 px-3"
                        onClick={() => toggleItem(item, foodPreferences, setFoodPreferences)}
                        data-testid={`badge-cuisine-${item}`}
                      >
                        {foodPreferences.includes(item) && <Check className="h-3 w-3 mr-1" />}
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Тип питания</Label>
                  <div className="flex flex-wrap gap-2">
                    {dietPreferencesOptions.map((item) => (
                      <Badge
                        key={item}
                        variant={foodPreferences.includes(item) ? "default" : "outline"}
                        className="cursor-pointer text-sm py-1.5 px-3"
                        onClick={() => toggleItem(item, foodPreferences, setFoodPreferences)}
                        data-testid={`badge-diet-${item}`}
                      >
                        {foodPreferences.includes(item) && <Check className="h-3 w-3 mr-1" />}
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 5 && (
            <>
              <CardHeader>
                <CardTitle>Создайте аккаунт</CardTitle>
                <CardDescription>
                  Последний шаг — введите ваши данные для входа
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    placeholder="Как вас зовут?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Минимум 6 символов"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="input-password"
                  />
                </div>
              </CardContent>
            </>
          )}

          <div className="p-6 pt-0 flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="gap-2"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Button>
            )}
            {step < 5 ? (
              <Button
                onClick={handleNext}
                className="flex-1 gap-2"
                data-testid="button-next"
              >
                Далее
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="flex-1 gap-2"
                disabled={registerMutation.isPending}
                data-testid="button-register"
              >
                {registerMutation.isPending ? "Регистрация..." : "Создать аккаунт"}
              </Button>
            )}
          </div>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Уже есть аккаунт?{" "}
          <Button
            variant="ghost"
            className="p-0 h-auto underline"
            onClick={() => setLocation("/login")}
            data-testid="link-login"
          >
            Войти
          </Button>
        </p>
      </div>
    </div>
  );
}
