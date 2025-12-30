import { getProjects } from "@/lib/projects";
import WorkWrapper from './wrapper';

export default function WorkPage() {
    const projects = getProjects();

    return (
        <div className="max-w-5xl mx-auto p-8">
            <h1 className="text-4xl font-bold mb-12 tracking-tighter">Selected Work</h1>
            <WorkWrapper projects={projects} />
        </div>
    );
}