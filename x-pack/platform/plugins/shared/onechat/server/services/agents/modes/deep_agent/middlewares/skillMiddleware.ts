import { FileData } from "@kbn/langchain-deep-agent";
import { AgentEventEmitter } from "@kbn/onechat-server/agents";
import { createMiddleware } from "langchain";
import { formatSkillsDirectoryTree } from "../utils/skills_directory_tree";

/**
 * The purpose of this middleware is to insert the skill frontmatter into the system prompt.
 * 
 * This is what enables the progressive disclosure of skills to the agent as the agent can
 * decide to read the full skill from the file system when required.
 * 
 * Example of text added to system prompt:
 * 
 * Skills are stored in the filesystem. Here is an overview of the skills directory:
 * /
 *   skills/
 *     security/
 *       get_alerts.md - Knowledge and guidance for retrieving security alerts
 *     platform/
 *       core/
 *         search.md - Search functionality documentation
 */
export const createSkillSystemPromptMiddleware = (
    events: AgentEventEmitter,
    skills: Record<string, FileData>,
) => {
    return createMiddleware({
        name: 'skillSystemPromptMiddleware',
        wrapModelCall: (request, handler) => {
            const formattedSkills = formatSkillsDirectoryTree(skills);
            const skillSystemPrompt = `## Agent Skills
In order to help achieve the highest-quality results possible, Elastic has compiled a set of "skills" which are essentially folders that contain a set of best practices for answering user questions. For instance, there is a skill that provides guidance on how to triage alerts. These skill folders have been heavily labored over and contain the condensed wisdom of a lot of trial and error working with LLMs to make really good, professional, outputs. Sometimes multiple skills may be required to get the best results, so one is not limited to just reading one.
            
Skills are stored in the filesystem. Here is an overview of the skills directory:
\n${formattedSkills}`;

            return handler({
                ...request,
                systemPrompt: (request.systemPrompt ? `${request.systemPrompt}\n\n` : "") + skillSystemPrompt,
            })
        }
    });
};