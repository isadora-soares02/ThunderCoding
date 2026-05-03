import { Compass } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const NotFound = () => (
    <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="max-w-md space-y-4 text-center">
            <Logo className="justify-center" />

            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Compass size={28} />
            </div>

            <h1 className="font-display text-5xl">404</h1>

            <p className="text-muted-foreground">
                A página que você procura não foi encontrada. Mas tem muito código
                esperando por você!
            </p>

            <Button asChild className="shadow-glow">
                <Link href="/dashboard">Voltar ao início</Link>
            </Button>
        </div>
    </div>
);

export default NotFound;
