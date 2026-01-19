import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChefHat, ArrowRight, ArrowLeft, Sparkles, Check, Utensils, ShoppingBag, Heart } from "lucide-react";
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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Progress value={progress} className="h-1.5 mb-4" />
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-muted-foreground">Шаг {step} из 5</span>
              {step > 1 && (
                <Button variant="ghost" size="sm" onClick={() => setLocation("/login")} className="text-muted-foreground">
                  Пропустить
                </Button>
              )}
            </div>
          </div>

          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <ChefHat className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Добро пожаловать!</h1>
                <p className="text-muted-foreground">
                  Настроим персональные рецепты под ваши предпочтения
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-8">
                <Card className="p-4 text-center border-0 shadow-sm">
                  <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Базовые продукты</p>
                </Card>
                <Card className="p-4 text-center border-0 shadow-sm">
                  <Utensils className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Оборудование</p>
                </Card>
                <Card className="p-4 text-center border-0 shadow-sm">
                  <Heart className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Вкусы</p>
                </Card>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Базовые продукты</h1>
                <p className="text-muted-foreground text-sm">
                  Что обычно есть у вас дома?
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {baseIngredientsOptions.map((item) => {
                  const isSelected = baseIngredients.includes(item);
                  return (
                    <Badge
                      key={item}
                      variant="outline"
                      onClick={() => toggleItem(item, baseIngredients, setBaseIngredients)}
                      className={`cursor-pointer py-2 px-4 text-sm transition-all ${
                        isSelected 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "hover:bg-muted"
                      }`}
                      data-testid={`badge-ingredient-${item}`}
                    >
                      {isSelected && <Check className="h-3 w-3 mr-1" />}
                      {item}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Оборудование</h1>
                <p className="text-muted-foreground text-sm">
                  Что у вас есть для готовки?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {equipmentOptions.map((item) => {
                  const isSelected = equipment.includes(item);
                  return (
                    <Card
                      key={item}
                      onClick={() => toggleItem(item, equipment, setEquipment)}
                      className={`cursor-pointer p-4 text-center transition-all border-2 ${
                        isSelected 
                          ? "border-primary bg-primary/5" 
                          : "border-transparent hover:border-muted"
                      }`}
                      data-testid={`badge-equipment-${item}`}
                    >
                      <span className={`text-sm font-medium ${isSelected ? "text-primary" : ""}`}>
                        {isSelected && <Check className="h-3 w-3 inline mr-1" />}
                        {item}
                      </span>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Предпочтения</h1>
                <p className="text-muted-foreground text-sm">
                  Какую еду вы любите?
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Кухня</Label>
                  <div className="flex flex-wrap gap-2">
                    {cuisinePreferencesOptions.map((item) => {
                      const isSelected = foodPreferences.includes(item);
                      return (
                        <Badge
                          key={item}
                          variant="outline"
                          onClick={() => toggleItem(item, foodPreferences, setFoodPreferences)}
                          className={`cursor-pointer py-2 px-3 text-sm transition-all ${
                            isSelected 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "hover:bg-muted"
                          }`}
                          data-testid={`badge-cuisine-${item}`}
                        >
                          {isSelected && <Check className="h-3 w-3 mr-1" />}
                          {item}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Тип питания</Label>
                  <div className="flex flex-wrap gap-2">
                    {dietPreferencesOptions.map((item) => {
                      const isSelected = foodPreferences.includes(item);
                      return (
                        <Badge
                          key={item}
                          variant="outline"
                          onClick={() => toggleItem(item, foodPreferences, setFoodPreferences)}
                          className={`cursor-pointer py-2 px-3 text-sm transition-all ${
                            isSelected 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "hover:bg-muted"
                          }`}
                          data-testid={`badge-diet-${item}`}
                        >
                          {isSelected && <Check className="h-3 w-3 mr-1" />}
                          {item}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Создайте аккаунт</h1>
                <p className="text-muted-foreground text-sm">
                  Последний шаг к персональным рецептам
                </p>
              </div>
              <Card className="p-6 border-0 shadow-md">
                <CardContent className="p-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm">Имя</Label>
                    <Input
                      id="name"
                      placeholder="Как вас зовут?"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12"
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12"
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm">Пароль</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Минимум 6 символов"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12"
                      data-testid="input-password"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleBack}
                className="gap-2"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {step < 5 ? (
              <Button
                onClick={handleNext}
                size="lg"
                className="flex-1 gap-2"
                data-testid="button-next"
              >
                Далее
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                size="lg"
                className="flex-1 gap-2"
                disabled={registerMutation.isPending}
                data-testid="button-register"
              >
                {registerMutation.isPending ? "Регистрация..." : "Создать аккаунт"}
              </Button>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
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
    </div>
  );
}
