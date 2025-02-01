import {Component} from "./base-components";
import {DragTarget} from "../models/drag-drop-interface";
import {Project, ProjectStatus} from "../models/project";
import {AutoBind} from "../decorators/autobind";
import {projectState} from "../state/project-state";
import {ProjectItem} from "./project-item";

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProject: Project[];

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false, `${type}-projects`)

        this.assignedProject = [];

        this.configure();
        this.renderContent();
    }

    @AutoBind
    dragOverHandler(event: DragEvent) {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable');
        }
    }

    @AutoBind
    dropHandler(event: DragEvent) {
        const projectId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(projectId, this.type === 'active' ? ProjectStatus.ACTIVE : ProjectStatus.FINISHED);
    }

    @AutoBind
    dragLeaveHandler(_: DragEvent) {
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.remove('droppable');
    }

    configure() {
        projectState.addListener((projects: Project[]) => {
            this.assignedProject = projects.filter(project => this.type === 'active' ? project.status === ProjectStatus.ACTIVE : project.status === ProjectStatus.FINISHED);
            this.renderProjects();
        });

        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);
    }

    renderContent() {
        this.element.querySelector('ul')!.id = `${this.type}-projects-list`;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        listEl.innerHTML = '';
        for (const projectItem of this.assignedProject) {
            new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
        }
    }
}