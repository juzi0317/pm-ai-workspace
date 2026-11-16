import re

with open('src/components/ai/AIScreening.tsx', 'r') as f:
    content = f.read()

# Replace the condition to be simpler for "no project":
# disabled condition: !agreeToRecruitment || (modalMatchMode === 'single' && modalProjectSource === 'upload' && !customSchemeFile) || (modalMatchMode === 'single' && modalProjectSource === 'library' && !modalSelectedLibraryProject)
# Wait, let's just make sure disabled is added as a prop.

pattern = r'(<button\s+onClick=\{.*?\}\s+className=\{`px-6 py-2.5 font-bold rounded-lg text-\[13px\] transition-colors flex items-center \$\{!\(agreeToRecruitment.*?\}.*?\}\s*>)'

# Wait, let's just use string replace. There are two instances.

replacement1 = '''<button
  disabled={!(agreeToRecruitment && (modalMatchMode === "full" || (modalProjectSource === "upload" ? !!customSchemeFile : !!modalSelectedLibraryProject)))}
  onClick={() => {
    // Collect form data
    const newPatientObj = {
      name: formShortName,
      fullName: formName,
      gender: formGender,
      age: parseInt(formAge) || 50,
      dob: formDob,
      disease: formDisease,
      phone: formPhone,
      source: formSource,
      idCard: formIdCard,
      referrer: formReferrer
    };
    handleWizardSubmitAndStartMatch(newPatientObj);
  }}
  className={`px-6 py-2.5 font-bold rounded-lg text-[13px] flex items-center ${!(agreeToRecruitment && (modalMatchMode === "full" || (modalProjectSource === "upload" ? !!customSchemeFile : !!modalSelectedLibraryProject))) ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : 'bg-[#083190] hover:bg-[#083190]/90 text-white shadow-sm'}`}
>'''

# I'll just use sed or Python to replace it.
