import os

with open('src/components/ai/AIDraft.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Locate handleStartDrafting block ending
end_of_drafting_idx = text.find('setIsSettingsDrawerOpen(false);\n      }\n    }, 400);\n  };')

# Locate first 'return (' after that
first_return_idx = text.find('return (', end_of_drafting_idx)

# Locate the handleSaveToProject function ending block (the one before the second return)
end_of_save_to_project_str = 'setShowSaveSuccess(true);\n    setTimeout(() => setShowSaveSuccess(false), 3000);\n  };'
save_to_project_end_idx = text.find(end_of_save_to_project_str, first_return_idx) + len(end_of_save_to_project_str)

if first_return_idx != -1 and save_to_project_end_idx != -1:
    replacement_fns = '''  const handleRevertSection = (sectionId: string) => {
    const updatedSessions = sessions.map((sess) => {
      if (sess.id === activeSession.id) {
        const updatedSections = sess.sections.map((sec) => {
          if (sec.id === sectionId && sec.originalContent) {
            return {
              ...sec,
              content: sec.originalContent,
              originalContent: undefined,
              aiNote: "已恢复为最初生成的版本。"
            };
          }
          return sec;
        });
        return { ...sess, sections: updatedSections };
      }
      return sess;
    });
    setSessions(updatedSessions);
    localStorage.setItem("totrial_draft_sessions", JSON.stringify(updatedSessions));
  };

  const handleSaveAdjustments = () => {
    const updatedSessions = sessions.map((sess) => {
      if (sess.id === activeSession.id) {
        const actualDesign = targetDesign === "自定义设计" ? (customDesign || "自定义设计") : targetDesign;
        
        // Dynamically replace old drug/indication names in document contents to keep it fully aligned
        const updatedSections = sess.sections.map(sec => {
          let content = sec.content;
          if (sess.drugName && targetDrug) {
            content = content.replace(new RegExp(sess.drugName, 'g'), targetDrug);
          }
          if (sess.indication && targetIndication) {
            content = content.replace(new RegExp(sess.indication, 'g'), targetIndication);
          }
          if (sess.phase && targetPhase) {
            content = content.replace(new RegExp(sess.phase, 'g'), targetPhase);
          }
          return { ...sec, content };
        });

        return {
          ...sess,
          drugName: targetDrug,
          indication: targetIndication,
          phase: targetPhase,
          designType: actualDesign,
          uploadedMaterials: [...tempUploaded],
          referenceLiterature: [...tempRefs],
          historicalTemplates: [...tempTemplates],
          title: f"{targetDrug}{targetIndication}临床研究方案草案",
          sections: updatedSections
        };
      }
      return sess;
    });

    setSessions(updatedSessions);
    localStorage.setItem("totrial_draft_sessions", JSON.stringify(updatedSessions));
    setIsSettingsDrawerOpen(false);
    
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      alert("必须保留至少一个历史方案草案！");
      return;
    }
    const updatedSessions = sessions.filter((sess) => sess.id !== id);
    setSessions(updatedSessions);
    localStorage.setItem("totrial_draft_sessions", JSON.stringify(updatedSessions));
    if (activeSessionId === id) {
      setActiveSessionId(updatedSessions[0].id);
    }
  };

  // Save full protocol to project documents!
  const handleSaveToProject = () => {
    const filename = f"{activeSession.drugName || '新药'}{activeSession.indication || '适应症'}临床试验方案(AI起草).docx";
    
    // Get existing custom generated documents from local storage
    const stored = localStorage.getItem("totrial_custom_generated_docs");
    const customGenerated = stored ? JSON.parse(stored) : [];

    const newDoc = {
      id: f"custom-doc-{Date.now()}",
      name: filename,
      type: "docx",
      size: "148 KB",
      createdAt: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\\//g, '-'),
      author: "AI 方案起草助手",
      project: selectedProject === "全部" ? "冠心宁片中保临床方案" : selectedProject, // default or active partition
    };

    customGenerated.push(newDoc);
    localStorage.setItem("totrial_custom_generated_docs", JSON.stringify(customGenerated));

    // Dispatch global events to update UI
    window.dispatchEvent(new Event("totrial_project_changed"));
    window.dispatchEvent(new Event("totrial_toggle_artifacts")); // optionally open documents drawer
    
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };'''

    new_text = text[:first_return_idx] + replacement_fns + text[save_to_project_end_idx:]
    with open('src/components/ai/AIDraft.tsx', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("Success!")
else:
    print("Indices not found!")
