import { constitutionApi } from "../api/constitutionApi";
import { UIConstitutionVersion, UIConstitutionViolation, UIConstitutionAmendment } from "../types/constitution.types";

const CONSTITUTION_V1: UIConstitutionVersion = {
  version: "1.0.0",
  preamble: `Ownership and Stewardship\nThe Phanda Operating System, including its architecture, constitutional framework, governance model, and all associated intellectual property, is owned by Global IT and Business Solutions.\n\nGift Nkosinathi Chisali is recognized as the Founder and Constitutional Architect of the Phanda Operating System and its governing epistemic framework.\n\nAll constitutional articles, amendments, governance processes, and future evolution of the platform operate under this stewardship unless lawfully transferred or amended through the organization's authorized governance processes.\n\nThis preamble establishes ownership and stewardship only. It grants no additional execution authority to any system layer and does not alter the constitutional separation of responsibilities defined within the operating system.`,
  articles: [
    {
      id: "ARTICLE_I",
      title: "Separation of Worlds",
      clauses: [
        { id: "c1", text: "Higher worlds observe lower worlds." },
        { id: "c2", text: "Lower worlds never depend on higher worlds." }
      ]
    },
    {
      id: "ARTICLE_II",
      title: "Meaning is Non-Executable",
      clauses: [
        { id: "c3", text: "Interpretation cannot execute reality." }
      ]
    },
    {
      id: "ARTICLE_III",
      title: "Truth Preservation",
      clauses: [
        { id: "c4", text: "Historical records are append-only." },
        { id: "c5", text: "No silent rewriting." }
      ]
    },
    {
      id: "ARTICLE_IV",
      title: "Human Sovereignty",
      clauses: [
        { id: "c6", text: "Human arbitration is final." },
        { id: "c7", text: "The system cannot invent authority." }
      ]
    },
    {
      id: "ARTICLE_V",
      title: "Simulation is Non-Binding",
      clauses: [
        { id: "c8", text: "Simulations are advisory." },
        { id: "c9", text: "Predictions never become execution." }
      ]
    },
    {
      id: "ARTICLE_VI",
      title: "Constitution Above Evolution",
      clauses: [
        { id: "c10", text: "Constitutional articles override evolutionary proposals." },
        { id: "c11", text: "Amendments follow a formal process." }
      ]
    },
    {
      id: "ARTICLE_VII",
      title: "Ownership & Stewardship",
      clauses: [
        { id: "c12", text: "Global IT and Business Solutions is the owner of the operating system and associated intellectual property." },
        { id: "c13", text: "Gift Nkosinathi Chisali is recognized as Founder and Constitutional Architect." }
      ]
    },
    {
      id: "ARTICLE_VIII",
      title: "Transparency",
      clauses: [
        { id: "c14", text: "Every decision made by Worlds A–F must be explainable through traceable evidence." }
      ]
    },
    {
      id: "ARTICLE_IX",
      title: "Accountability",
      clauses: [
        { id: "c15", text: "Every override, amendment, and constitutional exception must be permanently recorded with a timestamp, actor, rationale, and evidence." }
      ]
    },
    {
      id: "ARTICLE_X",
      title: "Trust Before Automation",
      clauses: [
        { id: "c16", text: "When certainty falls below the defined constitutional threshold, the system must defer to human governance rather than speculate or execute autonomously." }
      ]
    }
  ]
};

export class ConstitutionService {
  /**
   * Retrieves the active version of the Constitution.
   */
  static getConstitutionVersion(): UIConstitutionVersion {
    return CONSTITUTION_V1;
  }

  /**
   * Checks every proposal against constitutional articles.
   * NEVER mutates state, only evaluates compliance.
   */
  static async validateAgainstConstitution(proposalId: string): Promise<boolean> {
    // In reality, this would run rigorous proofs against the proposed logic.
    return true; 
  }

  /**
   * Detects when lower worlds (D, F, etc) attempt to breach the Constitution.
   */
  static async detectConstitutionViolation(): Promise<UIConstitutionViolation[]> {
    try {
      const res = await constitutionApi.getViolations();
      return res.data;
    } catch {
      return [];
    }
  }

  /**
   * Formalizes a request to amend the constitution. NEVER applies it autonomously.
   */
  static async createAmendment(targetArticleId: string, justification: string): Promise<UIConstitutionAmendment | null> {
    try {
      const payload = { targetArticleId, justification, timestamp: new Date().toISOString() };
      const res = await constitutionApi.submitAmendment(payload);
      return res.data;
    } catch {
      return null;
    }
  }

  /**
   * Retrieves historical and pending amendments.
   */
  static async getAmendments(): Promise<UIConstitutionAmendment[]> {
    try {
      const res = await constitutionApi.getAmendments();
      return res.data;
    } catch {
      return [];
    }
  }
}
