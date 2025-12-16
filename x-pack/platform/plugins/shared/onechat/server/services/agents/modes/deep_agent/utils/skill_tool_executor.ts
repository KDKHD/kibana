import { AgentEventEmitter } from "@kbn/onechat-server/agents";
import { AIMessage, DynamicStructuredTool, tool, ToolMessage } from "langchain";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';

export const createSkillToolExecutor = (tools: DynamicStructuredTool[], events: AgentEventEmitter) => {
    const toolNode = new ToolNode(tools)

    const skillExecutorTool = tool(async ({
        name,
        parameters,
    }, config)=>{

        // Create a message with the tool call that can be used to invoke the toolNode.
        const messageWithToolCalls = new AIMessage({
            tool_calls: [
                {
                    id: uuidv4(), // doesnt really matter what this is. The skillExecutorTool return will use the tool_call_id from the config.
                    name: name,
                    args: parameters,
                }
            ]
        })

        const result = await toolNode.invoke([messageWithToolCalls]) as ToolMessage[];

        const toolMessage = result.at(0)

        if (!toolMessage) {
            return "Tool called"
        }

        return new ToolMessage({
            content: toolMessage.content,
            artifact: toolMessage.artifact,
            contentBlocks: toolMessage.contentBlocks,
            status: toolMessage.status,
            tool_call_id: config.toolCall.id,
        })
    }, {
        name: 'invoke_skill',
        description: 'Invoke a skill by its ID with the provided parameters.',
        schema: z.object({
            name: z.string().describe('The name of the skill to invoke.'),
            parameters: z.object({}).passthrough().describe('The parameters to pass to the skill.'),
        })
    })

    return skillExecutorTool
}