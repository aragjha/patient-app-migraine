// Comprehensive Journey Maps content for Migraine Disease
// Based on migraine education with all stages, substages, and nodes

export type NodeType = "entry" | "choice" | "info" | "subsection";

export interface LessonNode {
  id: string;
  title: string;
  stage: string;
  substage?: string;
  nodeType: NodeType;
  status: "done" | "current" | "available";
  description: string;
  videoTitle?: string;
  aboutStation?: string;
  actionToTake?: string;
  moreDetails?: string;
  neuroQueryPrompts?: string[];
  questionsForTeam?: string[];
  considerations?: string;
  additionalResources?: string[];
  // For user tracking
  userIsHere?: boolean;
}

// All stages in the journey map
export const stages = ["Understanding Migraine", "Treatment & Management", "Living with Migraine"];

// Substages for each main stage
export const substages: Record<string, string[]> = {
  "Understanding Migraine": [
    "What Is Migraine",
    "Types of Migraine",
    "Phases & Triggers",
    "Genetics & Risk Factors",
  ],
  "Treatment & Management": [
    "Acute Treatments",
    "Preventive Treatments",
    "CGRP & New Therapies",
    "Medication Safety",
    "Creating a Treatment Plan",
  ],
  "Living with Migraine": [
    "Lifestyle Modifications",
    "Trigger Management",
    "Sleep & Stress",
    "Diet & Exercise",
    "Work & Daily Life",
  ],
};

// All lessons/nodes in the journey map
export const allLessons: LessonNode[] = [
  // ============================================
  // UNDERSTANDING MIGRAINE STAGE
  // ============================================

  // Substage: What Is Migraine
  {
    id: "understand-1",
    title: "What Is Migraine?",
    stage: "Understanding Migraine",
    substage: "What Is Migraine",
    nodeType: "entry",
    status: "available",
    description: "Understanding migraine as a neurological disease, not just a headache.",
    videoTitle: "Migraine: More Than Just a Headache (American Migraine Foundation)",
    aboutStation: "Migraine is a complex neurological condition characterized by recurrent episodes of moderate to severe head pain, often accompanied by nausea, vomiting, and extreme sensitivity to light and sound. It affects over 1 billion people worldwide and is the second leading cause of disability globally. Migraine involves changes in brain chemicals, nerve signaling, and blood flow — it is not simply a bad headache.",
    actionToTake: "Learn to distinguish migraine from other headache types. Start a headache diary to track frequency, duration, and associated symptoms. Share your diary with your doctor to help establish a diagnosis. If you experience more than 4 migraine days per month, discuss preventive treatment.",
    moreDetails: "Migraine can occur with or without aura. Attacks typically last 4 to 72 hours if untreated. Women are three times more likely than men to experience migraine, likely due to hormonal influences. Migraine often runs in families — if one parent has migraine, there is a 50% chance their child will too.",
    neuroQueryPrompts: [
      "How do I know if my headaches are migraines?",
      "What makes migraine different from tension headaches?",
      "Is migraine a lifelong condition?",
    ],
    questionsForTeam: [
      "What criteria do you use to diagnose migraine?",
      "Should I keep a headache diary and what should I track?",
      "How often should I expect to have follow-up appointments?",
    ],
    considerations: "Family history, frequency and severity of attacks, impact on daily life and work productivity.",
    additionalResources: [
      "American Migraine Foundation: What is Migraine?",
      "World Health Organization fact sheet on headache disorders",
    ],
  },
  {
    id: "understand-2",
    title: "Migraine vs Other Headaches",
    stage: "Understanding Migraine",
    substage: "What Is Migraine",
    nodeType: "info",
    status: "available",
    description: "Distinguishing migraine from tension headaches, cluster headaches, and secondary headaches.",
    videoTitle: "Types of Headaches Explained",
    aboutStation: "Tension-type headaches cause mild to moderate bilateral pressing pain without nausea or light sensitivity. Cluster headaches cause severe unilateral pain around the eye with autonomic features (tearing, nasal congestion). Secondary headaches arise from underlying conditions like infection, injury, or vascular problems. Migraine is distinguished by its unilateral throbbing quality, moderate to severe intensity, and associated symptoms (nausea, photophobia, phonophobia).",
    actionToTake: "Compare your symptoms against the ICHD-3 diagnostic criteria for migraine. Note whether your headaches are one-sided and throbbing, whether they are aggravated by routine physical activity, and whether nausea or sensitivity to light/sound accompanies the pain.",
    moreDetails: "Red flags that suggest a secondary headache requiring urgent evaluation include: sudden thunderclap onset, headache with fever and stiff neck, headache after head injury, new headache after age 50, or headache with neurological deficits. These require immediate medical attention.",
    neuroQueryPrompts: [
      "Could my headaches be tension-type rather than migraine?",
      "What red flags should prompt me to go to the emergency room?",
      "Can I have more than one type of headache?",
    ],
    questionsForTeam: [
      "Do I need imaging to rule out secondary causes?",
      "How do you differentiate migraine from cluster headaches?",
      "Could medication overuse be causing my headaches?",
    ],
    considerations: "Headache frequency, pain characteristics, associated symptoms, family history, response to treatment.",
    additionalResources: [
      "International Headache Society ICHD-3 criteria",
      "National Headache Foundation headache type comparison",
    ],
  },

  // Substage: Types of Migraine
  {
    id: "understand-3",
    title: "Migraine With Aura",
    stage: "Understanding Migraine",
    substage: "Types of Migraine",
    nodeType: "info",
    status: "available",
    description: "Understanding the aura phase and its visual, sensory, and speech disturbances.",
    videoTitle: "Migraine Aura Explained (American Migraine Foundation)",
    aboutStation: "Approximately 25-30% of people with migraine experience aura — temporary neurological symptoms that usually precede the headache phase. Visual aura is most common, presenting as flickering lights, zigzag lines (fortification spectra), or blind spots (scotoma). Sensory aura causes tingling or numbness, typically starting in the hand and spreading up the arm to the face. Speech aura causes difficulty finding words or slurred speech. Aura symptoms develop gradually over 5-20 minutes and last less than 60 minutes.",
    actionToTake: "Learn to recognize your specific aura pattern. Use the onset of aura as a signal to take acute medication early, which improves treatment effectiveness. Document your aura symptoms to share with your doctor.",
    moreDetails: "Aura without headache (acephalgic migraine) can occur, especially in older adults. Prolonged aura lasting more than 60 minutes should be reported to your doctor. Migraine with aura is associated with a slightly increased risk of stroke, particularly in women who smoke or use estrogen-containing contraceptives.",
    neuroQueryPrompts: [
      "Is my visual disturbance an aura or something more serious?",
      "Can aura change over time or present differently each attack?",
      "Should I take my medication during the aura phase or wait for the headache?",
    ],
    questionsForTeam: [
      "Does having aura affect my contraceptive options?",
      "Should I be screened for stroke risk factors?",
      "What should I do if my aura lasts longer than an hour?",
    ],
    considerations: "Cardiovascular risk factors, contraceptive use, smoking status, aura duration and characteristics.",
    additionalResources: [
      "American Migraine Foundation: Understanding Migraine With Aura",
      "Migraine Trust: Aura information sheet",
    ],
  },
  {
    id: "understand-4",
    title: "Chronic, Vestibular & Hemiplegic Migraine",
    stage: "Understanding Migraine",
    substage: "Types of Migraine",
    nodeType: "info",
    status: "available",
    description: "Understanding less common but impactful migraine subtypes.",
    videoTitle: "Chronic Migraine and Special Subtypes",
    aboutStation: "Chronic migraine is defined as headache on 15 or more days per month for at least 3 months, with migraine features on at least 8 of those days. Vestibular migraine causes episodes of vertigo or dizziness, sometimes without significant headache. Hemiplegic migraine is a rare form that includes temporary motor weakness (hemiplegia) as part of the aura phase, mimicking stroke symptoms. Each subtype requires specific diagnostic and treatment approaches.",
    actionToTake: "If you have headaches more than 15 days per month, discuss chronic migraine with your doctor. If you experience dizziness or vertigo with headaches, ask about vestibular migraine. If you develop weakness during attacks, seek urgent evaluation to rule out stroke, especially with the first episode.",
    moreDetails: "Chronic migraine often develops from episodic migraine through a process called chronification, which can be accelerated by medication overuse, obesity, sleep disorders, caffeine overuse, and psychological stress. Vestibular migraine is one of the most common causes of recurrent vertigo. Hemiplegic migraine can be familial (genetic) or sporadic, and triptans are typically avoided in this subtype due to theoretical vascular concerns.",
    neuroQueryPrompts: [
      "How many headache days per month qualifies as chronic migraine?",
      "Could my dizziness be caused by vestibular migraine?",
      "What makes hemiplegic migraine different and how is it treated?",
    ],
    questionsForTeam: [
      "Am I at risk of transitioning from episodic to chronic migraine?",
      "Do I need additional testing for vestibular or hemiplegic migraine?",
      "Are there specific preventive treatments for chronic migraine?",
    ],
    considerations: "Headache frequency trends, medication use patterns, vertigo history, family history of hemiplegic migraine.",
    additionalResources: [
      "American Headache Society: Chronic Migraine guidelines",
      "Vestibular Disorders Association (VeDA) vestibular migraine resources",
    ],
  },

  // Substage: Phases & Triggers
  {
    id: "understand-5",
    title: "The Four Phases of Migraine",
    stage: "Understanding Migraine",
    substage: "Phases & Triggers",
    nodeType: "info",
    status: "available",
    description: "Understanding the prodrome, aura, headache, and postdrome phases.",
    videoTitle: "The Phases of a Migraine Attack",
    aboutStation: "A migraine attack has up to four distinct phases. Prodrome (hours to days before): mood changes, food cravings, yawning, neck stiffness, fatigue. Aura (5-60 minutes): visual, sensory, or speech disturbances in about 25% of patients. Headache phase (4-72 hours): moderate to severe throbbing pain, often unilateral, with nausea, photophobia, and phonophobia. Postdrome (24-48 hours after): fatigue, difficulty concentrating, mood changes — often called the migraine hangover. Not every person experiences all four phases in every attack.",
    actionToTake: "Learn to identify your prodrome symptoms as early warning signals. Recognizing prodrome allows you to prepare: take acute medication early, reduce stimulation, hydrate, and clear your schedule if possible. Track which phases you experience to help your doctor tailor treatment.",
    moreDetails: "The prodrome phase is often underrecognized. Common prodrome symptoms include food cravings (especially for sweet or salty foods), which are sometimes mistaken as triggers rather than early symptoms. The postdrome phase can be just as disabling as the headache itself, with many patients describing brain fog, exhaustion, and emotional vulnerability for 24-48 hours after the pain resolves.",
    neuroQueryPrompts: [
      "How can I tell the difference between a prodrome symptom and a trigger?",
      "Does treating during the prodrome work better than waiting for the headache?",
      "What should I do during the postdrome phase to recover faster?",
    ],
    questionsForTeam: [
      "Should I take medication during the prodrome or wait for pain to start?",
      "Is the postdrome phase something that can be treated?",
      "How do I log the different phases in my headache diary?",
    ],
    considerations: "Ability to recognize prodrome symptoms, willingness to treat early, work schedule flexibility.",
    additionalResources: [
      "American Migraine Foundation: The Timeline of a Migraine Attack",
      "Migraine Research Foundation: Phases of Migraine",
    ],
  },
  {
    id: "understand-6",
    title: "Common Migraine Triggers",
    stage: "Understanding Migraine",
    substage: "Phases & Triggers",
    nodeType: "info",
    status: "available",
    description: "Identifying and understanding the most common migraine triggers.",
    videoTitle: "Migraine Triggers: Myths and Facts",
    aboutStation: "Migraine triggers are factors that can provoke an attack in a susceptible individual. Common triggers include: stress and letdown after stress, hormonal changes (menstruation, ovulation), irregular sleep (too little or too much), skipped meals, weather changes (barometric pressure drops), bright or flickering lights, strong odors, alcohol (especially red wine), certain foods (aged cheese, processed meats, MSG, chocolate), and neck tension. Triggers are cumulative — a single trigger may not cause an attack, but multiple triggers together can push past the threshold.",
    actionToTake: "Use a headache diary to identify your personal triggers over 2-3 months. Do not eliminate all suspected triggers at once — test one at a time. Focus on modifiable triggers like sleep regularity, meal timing, hydration, and stress management rather than trying to avoid everything.",
    moreDetails: "Not all reported triggers are true triggers. For example, chocolate cravings during prodrome are often mistaken as triggers. Weather is a common reported trigger but is non-modifiable — focus on what you can control. The trigger threshold model explains why the same trigger may cause an attack one day but not another: the brain's threshold fluctuates based on cumulative stress, sleep, hormones, and other factors.",
    neuroQueryPrompts: [
      "How do I distinguish between a trigger and a prodrome symptom?",
      "Can triggers change over time?",
      "Is there a way to raise my migraine threshold?",
    ],
    questionsForTeam: [
      "Should I follow an elimination diet to identify food triggers?",
      "How does my menstrual cycle relate to my migraines?",
      "Are weather-triggered migraines treatable differently?",
    ],
    considerations: "Personal trigger profile, modifiable vs non-modifiable triggers, cumulative trigger load, diary compliance.",
    additionalResources: [
      "American Migraine Foundation: Trigger Management",
      "National Headache Foundation: Headache Trigger Toolkit",
    ],
  },

  // Substage: Genetics & Risk Factors
  {
    id: "understand-7",
    title: "Genetics & Who Gets Migraine",
    stage: "Understanding Migraine",
    substage: "Genetics & Risk Factors",
    nodeType: "info",
    status: "available",
    description: "Understanding the genetic and environmental factors that contribute to migraine risk.",
    videoTitle: "Is Migraine Genetic? (Migraine Research Foundation)",
    aboutStation: "Migraine has a strong genetic component. If one parent has migraine, a child has approximately a 50% chance of developing it; if both parents have migraine, the risk rises to about 75%. Genome-wide association studies have identified over 40 genetic variants associated with migraine susceptibility, many related to vascular and neuronal function. Environmental factors — stress, sleep disruption, hormonal changes — interact with genetic predisposition to trigger attacks. Migraine is three times more common in women, with prevalence peaking between ages 25-55.",
    actionToTake: "Document your family history of migraine and headache disorders. Share this information with your doctor, as it helps confirm the diagnosis and predict response to certain treatments. Understand that while genetics cannot be changed, environmental and lifestyle factors can be modified to reduce attack frequency.",
    moreDetails: "Specific genetic mutations cause hemiplegic migraine (CACNA1A, ATP1A2, SCN1A genes). For common migraine, the genetic contribution is polygenic — many genes each contributing a small amount of risk. Epigenetic factors (how genes are expressed) may explain why migraine can worsen or improve during different life stages (puberty, pregnancy, menopause).",
    neuroQueryPrompts: [
      "If my parent has migraine, how likely am I to develop it?",
      "Can genetic testing help guide my migraine treatment?",
      "Will my children inherit my migraine?",
    ],
    questionsForTeam: [
      "Does my family history suggest a specific migraine subtype?",
      "Are there genetic tests relevant to my migraine treatment?",
      "How do hormonal changes throughout life affect migraine genetics?",
    ],
    considerations: "Family history depth, reproductive planning, hormonal milestones, response to treatments.",
    additionalResources: [
      "Migraine Research Foundation: Genetics of Migraine",
      "National Institute of Neurological Disorders and Stroke (NINDS) Migraine overview",
    ],
  },
  {
    id: "understand-8",
    title: "Is My Migraine Getting Worse?",
    stage: "Understanding Migraine",
    substage: "Genetics & Risk Factors",
    nodeType: "choice",
    status: "available",
    description: "Evaluating whether your migraine pattern is worsening and when to escalate care.",
    aboutStation: "Migraine frequency and severity can change over time. Risk factors for worsening (chronification) include: overuse of acute medications (more than 10-15 days per month), obesity, depression, anxiety, sleep disorders, caffeine overuse, and stressful life events. Recognizing escalation early allows intervention before episodic migraine becomes chronic.",
    actionToTake: "Yes (attacks increasing in frequency or severity): Schedule an appointment with a headache specialist to discuss preventive treatment. Review your acute medication use for potential overuse. Address modifiable risk factors. No (stable pattern): Continue current management and monitoring. Maintain healthy habits to prevent progression.",
    moreDetails: "Medication overuse headache (MOH) is one of the most common and reversible causes of worsening headache. It occurs when acute medications are used too frequently, creating a rebound cycle. Triptans used more than 10 days/month or simple analgesics used more than 15 days/month can trigger MOH. Breaking the cycle requires supervised withdrawal and bridging therapy.",
    neuroQueryPrompts: [
      "How many headache days per month indicates I should see a specialist?",
      "Am I overusing my acute medication?",
      "What factors are making my migraines worse?",
    ],
    questionsForTeam: [
      "Should I be referred to a headache specialist?",
      "Am I a candidate for preventive medication?",
      "How do we address my modifiable risk factors?",
    ],
    considerations: "Current headache frequency, acute medication days per month, comorbid conditions, quality of life impact.",
    additionalResources: [
      "American Headache Society: When to See a Specialist",
      "Migraine Trust: Medication Overuse Headache",
    ],
  },

  // ============================================
  // TREATMENT & MANAGEMENT STAGE
  // ============================================

  // Substage: Acute Treatments
  {
    id: "treat-1",
    title: "Acute Treatment Principles",
    stage: "Treatment & Management",
    substage: "Acute Treatments",
    nodeType: "entry",
    status: "available",
    description: "Understanding how to effectively treat a migraine attack when it starts.",
    videoTitle: "Treating a Migraine Attack (American Migraine Foundation)",
    aboutStation: "Effective acute treatment depends on treating early and using the right medication at the right dose. The American Headache Society recommends treating within 60 minutes of pain onset when pain is still mild. Stratified care — matching treatment intensity to attack severity — is more effective than step care (starting with mild treatments and escalating). For mild to moderate attacks, NSAIDs (ibuprofen 400-600mg, naproxen 500mg) or aspirin (900-1000mg) with an antiemetic may suffice. For moderate to severe attacks, triptans are first-line.",
    actionToTake: "Identify your go-to acute medication and keep it accessible at all times (home, work, bag). Treat at the first sign of pain — do not wait to see if it gets worse. Track your response: if pain is not significantly reduced within 2 hours, discuss alternative acute options with your doctor. Limit acute medication use to no more than 2-3 days per week to prevent medication overuse headache.",
    moreDetails: "Route of administration matters: oral medications may not work well if you have nausea or vomiting. In those cases, consider nasal sprays (sumatriptan, zolmitriptan), injections (sumatriptan subcutaneous), or rectal suppositories. Adding an antiemetic (metoclopramide 10mg) can improve absorption of oral medications and treat nausea.",
    neuroQueryPrompts: [
      "Should I treat during the aura or wait for the headache?",
      "Why does my medication sometimes work and sometimes not?",
      "How do I know if I am using acute medication too often?",
    ],
    questionsForTeam: [
      "Which acute medication is best for my attack severity?",
      "Should I try a different route of administration?",
      "How many days per month can I safely use acute medication?",
    ],
    considerations: "Attack severity, nausea/vomiting presence, medication access, risk of overuse, cardiovascular history.",
    additionalResources: [
      "American Headache Society: Acute Treatment guidelines",
      "NICE Clinical Knowledge Summary: Migraine acute treatment",
    ],
  },
  {
    id: "treat-2",
    title: "Triptans: The Gold Standard",
    stage: "Treatment & Management",
    substage: "Acute Treatments",
    nodeType: "info",
    status: "available",
    description: "Understanding how triptans work and choosing the right one for you.",
    videoTitle: "Triptans for Migraine (Mayo Clinic)",
    aboutStation: "Triptans are serotonin (5-HT1B/1D) receptor agonists that constrict dilated blood vessels, block pain pathways in the trigeminal nerve, and inhibit release of inflammatory neuropeptides. Seven triptans are available: sumatriptan, rizatriptan, eletriptan, zolmitriptan, naratriptan, almotriptan, and frovatriptan. They differ in speed of onset, duration, and formulation. Sumatriptan (injection) is fastest-acting; frovatriptan has the longest half-life and is useful for menstrual migraine prevention.",
    actionToTake: "If you have not tried a triptan, ask your doctor which one suits your attack pattern. If one triptan fails, try at least two others before concluding triptans do not work for you. Take triptans early in the attack. A second dose can be taken if headache recurs after initial relief, but do not take a second dose if the first had no effect.",
    moreDetails: "Triptans are contraindicated in uncontrolled hypertension, coronary artery disease, prior stroke, and hemiplegic or basilar migraine. Common side effects include chest tightness (triptan sensation, not cardiac), tingling, drowsiness, and dizziness. Triptans should not be used on more than 10 days per month to avoid medication overuse headache.",
    neuroQueryPrompts: [
      "Which triptan works fastest for severe attacks?",
      "Is chest tightness after taking a triptan dangerous?",
      "Can I take a triptan if I also take an antidepressant?",
    ],
    questionsForTeam: [
      "Which triptan do you recommend for my specific attack pattern?",
      "Are triptans safe for me given my medical history?",
      "If one triptan does not work, should I try another?",
    ],
    considerations: "Cardiovascular risk factors, other medications (SSRIs/SNRIs), attack characteristics, onset speed needed.",
    additionalResources: [
      "American Migraine Foundation: Guide to Triptans",
      "Migraine Trust: Triptan comparison chart",
    ],
  },
  {
    id: "treat-3",
    title: "Acute Treatment Not Working?",
    stage: "Treatment & Management",
    substage: "Acute Treatments",
    nodeType: "choice",
    status: "available",
    description: "Evaluating when acute treatment is inadequate and considering alternatives.",
    aboutStation: "Acute treatment is considered inadequate if: pain is not reduced to mild or no pain within 2 hours, headache recurs within 24 hours requiring re-dosing, you need to use acute medication more than 2-3 days per week, or side effects are intolerable. Approximately 30-40% of patients do not respond adequately to their first acute medication.",
    actionToTake: "Yes (treatment inadequate): Discuss alternative acute medications (different triptan, gepant, ditan), combination therapy (triptan + NSAID), or adding preventive treatment to reduce attack frequency. No (treatment effective): Continue current acute regimen. Ensure you are not overusing medication.",
    moreDetails: "Newer acute options include gepants (ubrogepant, rimegepant) which are CGRP receptor antagonists without cardiovascular contraindications, and lasmiditan (a ditan) which targets 5-HT1F receptors without vasoconstriction. These are alternatives for patients who cannot use triptans. Combination therapy (e.g., sumatriptan 85mg + naproxen 500mg) is more effective than either agent alone.",
    neuroQueryPrompts: [
      "What are gepants and how are they different from triptans?",
      "Can I combine a triptan with an anti-inflammatory?",
      "What is lasmiditan and who should consider it?",
    ],
    questionsForTeam: [
      "Should I switch to a different acute medication class?",
      "Am I a candidate for gepants or ditans?",
      "Would adding preventive treatment reduce my need for acute medication?",
    ],
    considerations: "Response to current treatment, cardiovascular status, frequency of acute medication use, cost and insurance.",
    additionalResources: [
      "American Headache Society: Consensus on Acute Treatment",
      "NHF: When Triptans Don't Work",
    ],
  },

  // Substage: Preventive Treatments
  {
    id: "treat-4",
    title: "When to Start Preventive Treatment",
    stage: "Treatment & Management",
    substage: "Preventive Treatments",
    nodeType: "entry",
    status: "available",
    description: "Understanding who benefits from preventive migraine medication and when to begin.",
    videoTitle: "Preventive Migraine Treatment: Who Needs It? (AHS)",
    aboutStation: "Preventive treatment is recommended when: attacks occur 4 or more days per month, attacks are severe or prolonged despite acute treatment, acute medications are overused or contraindicated, or migraine significantly impairs quality of life. The goal is to reduce attack frequency by at least 50%, reduce severity, and improve response to acute treatment. Preventive medications take 2-3 months to show full effect.",
    actionToTake: "Discuss preventive treatment with your doctor if you meet any of the criteria above. Set realistic expectations: most preventives reduce attacks by 50% rather than eliminating them. Commit to a 2-3 month trial before judging effectiveness. Keep a headache diary to objectively track improvement.",
    moreDetails: "Traditional oral preventives include beta-blockers (propranolol), anticonvulsants (topiramate, valproic acid), and antidepressants (amitriptyline, venlafaxine). Choice depends on comorbid conditions: propranolol for migraine with anxiety or hypertension, amitriptyline for migraine with insomnia or tension-type headache, topiramate for migraine with obesity. All require gradual dose escalation and monitoring for side effects.",
    neuroQueryPrompts: [
      "How many migraine days per month warrants prevention?",
      "How long do I need to take a preventive medication?",
      "Can I stop preventive medication once my migraines improve?",
    ],
    questionsForTeam: [
      "Which preventive medication is best for my profile?",
      "What side effects should I watch for?",
      "How do we measure whether the preventive is working?",
    ],
    considerations: "Attack frequency and severity, comorbid conditions, pregnancy planning, medication tolerance, cost.",
    additionalResources: [
      "American Headache Society: Preventive Treatment Consensus",
      "NICE guideline: Migraine prophylaxis",
    ],
  },
  {
    id: "treat-5",
    title: "Traditional Oral Preventives",
    stage: "Treatment & Management",
    substage: "Preventive Treatments",
    nodeType: "info",
    status: "available",
    description: "Overview of beta-blockers, anticonvulsants, and antidepressants used for migraine prevention.",
    videoTitle: "Migraine Prevention Medications Explained",
    aboutStation: "Propranolol (40-240mg/day) is a well-established beta-blocker for migraine prevention with good evidence, particularly beneficial if you also have anxiety or hypertension. Topiramate (50-200mg/day) is an anticonvulsant with strong evidence but notable side effects including cognitive dulling, tingling, and weight loss. Amitriptyline (10-75mg at bedtime) is a tricyclic antidepressant helpful for migraine with comorbid tension headache, insomnia, or depression. Venlafaxine (75-150mg/day) is an SNRI alternative. Valproic acid (500-1500mg/day) is effective but requires monitoring for liver function and is contraindicated in pregnancy.",
    actionToTake: "Start at the lowest effective dose and increase gradually. Give each medication a full 2-3 month trial at adequate dose before switching. Report side effects promptly. Do not stop beta-blockers abruptly — taper under medical supervision. If one class fails, try a medication from a different class.",
    moreDetails: "Side effect profiles guide medication choice. Topiramate may cause word-finding difficulty and paresthesias but promotes weight loss. Propranolol can cause fatigue, cold extremities, and exercise intolerance. Amitriptyline causes drowsiness and weight gain but improves sleep. Valproic acid requires regular blood monitoring and reliable contraception in women of childbearing age due to teratogenicity.",
    neuroQueryPrompts: [
      "Which preventive has the fewest side effects?",
      "Can I take a preventive medication if I am planning pregnancy?",
      "How do I taper off a preventive medication safely?",
    ],
    questionsForTeam: [
      "Given my other health conditions, which preventive is safest?",
      "What blood tests do I need while on this medication?",
      "How long should I stay on preventive medication?",
    ],
    considerations: "Comorbid conditions, pregnancy planning, side effect tolerance, prior medication trials, cost.",
    additionalResources: [
      "American Academy of Neurology: Migraine Prevention Practice Guideline",
      "Cochrane Reviews: Migraine prophylaxis",
    ],
  },

  // Substage: CGRP & New Therapies
  {
    id: "treat-6",
    title: "CGRP-Targeted Therapies",
    stage: "Treatment & Management",
    substage: "CGRP & New Therapies",
    nodeType: "info",
    status: "available",
    description: "Understanding the new class of migraine-specific preventive treatments targeting CGRP.",
    videoTitle: "CGRP Treatments for Migraine: A New Era (AMF)",
    aboutStation: "Calcitonin Gene-Related Peptide (CGRP) is a key molecule in migraine pathophysiology. During a migraine attack, CGRP levels rise, causing blood vessel dilation and pain signaling. CGRP-targeted therapies are the first medications designed specifically for migraine prevention. Monoclonal antibodies (erenumab/Aimovig, fremanezumab/Ajovy, galcanezumab/Emgality) are given as monthly or quarterly injections and block CGRP or its receptor. Oral CGRP antagonists (gepants) — atogepant/Qulipta and rimegepant/Nurtec — are taken daily or every other day for prevention.",
    actionToTake: "If traditional preventives have failed or caused intolerable side effects, ask your doctor about CGRP therapies. These medications typically show benefit within the first month, faster than traditional preventives. Side effects are generally mild (injection site reactions, constipation). No titration is needed — you start at the therapeutic dose.",
    moreDetails: "CGRP antibodies have very few drug interactions and are generally well tolerated. They are not metabolized by the liver or kidneys, making them suitable for patients with liver or kidney concerns. Rimegepant (Nurtec) has dual approval for both acute treatment and prevention, making it unique. Long-term safety data is accumulating and looks favorable. Cost and insurance coverage remain barriers for some patients.",
    neuroQueryPrompts: [
      "How do CGRP medications differ from traditional preventives?",
      "Can I use a CGRP antibody if I also take a triptan for acute attacks?",
      "How quickly will I know if a CGRP therapy is working?",
    ],
    questionsForTeam: [
      "Am I a candidate for CGRP therapy?",
      "Will my insurance cover CGRP antibodies?",
      "Should I try an injection or an oral gepant for prevention?",
    ],
    considerations: "Prior preventive failures, cardiovascular disease (CGRP's role in cardioprotection is debated), cost, insurance coverage, preference for injection vs oral medication.",
    additionalResources: [
      "American Migraine Foundation: CGRP Treatment Guide",
      "Migraine Research Foundation: CGRP and Migraine",
    ],
  },
  {
    id: "treat-7",
    title: "Botox for Chronic Migraine",
    stage: "Treatment & Management",
    substage: "CGRP & New Therapies",
    nodeType: "info",
    status: "available",
    description: "Understanding onabotulinumtoxinA (Botox) treatment for chronic migraine.",
    videoTitle: "Botox for Chronic Migraine: What to Expect",
    aboutStation: "OnabotulinumtoxinA (Botox) is FDA-approved specifically for chronic migraine (15+ headache days per month). Treatment involves 31 injections across 7 head and neck muscle areas every 12 weeks. Botox works by blocking neurotransmitter release at nerve endings, reducing pain signaling. It takes 2-3 treatment cycles (6-9 months) to assess full benefit. Studies show Botox reduces headache days by approximately 8-9 days per month in chronic migraine.",
    actionToTake: "If you have chronic migraine and have not responded to 2-3 oral preventives, discuss Botox with a headache specialist. Treatment is administered in-office and takes about 15 minutes. Commit to at least 3 treatment cycles before judging effectiveness. Common side effects include neck pain, injection site soreness, and occasionally drooping eyelid.",
    moreDetails: "Botox is only approved for chronic migraine, not episodic migraine (fewer than 15 headache days per month). Insurance typically requires documentation of chronic migraine and failure of 2-3 prior preventives. Some patients benefit from combining Botox with CGRP antibodies for refractory chronic migraine. Botox is pregnancy category C and generally avoided during pregnancy.",
    neuroQueryPrompts: [
      "How many treatment sessions do I need before I see results?",
      "Can I combine Botox with other preventive medications?",
      "What happens if I miss a Botox appointment?",
    ],
    questionsForTeam: [
      "Do I meet the criteria for Botox treatment?",
      "How do we get insurance approval for Botox?",
      "What should I expect during and after the injection session?",
    ],
    considerations: "Chronic migraine diagnosis confirmation, prior treatment failures, insurance requirements, pregnancy planning, commitment to 12-week cycle.",
    additionalResources: [
      "American Migraine Foundation: Botox for Migraine",
      "Allergan Botox for chronic migraine patient guide",
    ],
  },

  // Substage: Medication Safety
  {
    id: "treat-8",
    title: "Medication Overuse Headache",
    stage: "Treatment & Management",
    substage: "Medication Safety",
    nodeType: "info",
    status: "available",
    description: "Understanding and preventing medication overuse headache (MOH).",
    videoTitle: "Medication Overuse Headache Explained (AHS)",
    aboutStation: "Medication overuse headache (MOH) is one of the most common and treatable causes of chronic daily headache. It develops when acute headache medications are used too frequently: triptans, ergots, or combination analgesics on 10+ days per month, or simple analgesics (NSAIDs, acetaminophen) on 15+ days per month, for more than 3 months. The brain becomes dependent on the medication and headaches worsen as a rebound effect. MOH affects 1-2% of the general population and up to 50% of patients in headache clinics.",
    actionToTake: "Track your acute medication use carefully. If you are using acute medication more than 2-3 days per week, talk to your doctor about reducing use. Withdrawal may temporarily worsen headaches for 1-2 weeks but is necessary for improvement. Your doctor may prescribe bridging therapy (steroids, nerve blocks) and start preventive medication during withdrawal.",
    moreDetails: "Withdrawal approaches include abrupt discontinuation (most common for triptans and simple analgesics) or gradual taper (for opioids, barbiturates, or combined medications). Preventive medication should be started concurrently. Education and behavioral support improve success rates. After successful withdrawal, most patients see significant improvement within 2-3 months. Relapse rates are approximately 30% within the first year.",
    neuroQueryPrompts: [
      "How do I know if I have medication overuse headache?",
      "What happens during the withdrawal period?",
      "How do I manage pain during withdrawal?",
    ],
    questionsForTeam: [
      "Should I stop my acute medication abruptly or taper?",
      "What bridging therapy can help during withdrawal?",
      "How do we prevent MOH from recurring?",
    ],
    considerations: "Type of medication overused, withdrawal severity, concurrent preventive medication, behavioral support needs.",
    additionalResources: [
      "International Headache Society: MOH diagnostic criteria",
      "American Headache Society: MOH patient education",
    ],
  },
  {
    id: "treat-9",
    title: "When to See a Headache Specialist",
    stage: "Treatment & Management",
    substage: "Medication Safety",
    nodeType: "choice",
    status: "available",
    description: "Recognizing when primary care management is insufficient and specialist referral is needed.",
    aboutStation: "Consider referral to a headache specialist or neurologist when: diagnosis is uncertain, 2-3 acute or preventive medications have failed, medication overuse headache is present, headaches are worsening despite treatment, new or unusual symptoms develop, or migraine significantly impacts quality of life and work productivity.",
    actionToTake: "Yes (specialist referral needed): Ask your primary care provider for a referral to a headache specialist or neurologist. Prepare by bringing your headache diary, medication history, and list of prior treatments and their results. No (current management adequate): Continue working with your primary care provider. Reassess if your pattern changes.",
    moreDetails: "Headache specialists are neurologists with additional training in headache medicine. They have access to advanced treatments (Botox, CGRP therapies, nerve blocks), specialized diagnostic tools, and multidisciplinary headache programs. Wait times can be long, so request referral early. Telehealth appointments are increasingly available.",
    neuroQueryPrompts: [
      "What makes a headache specialist different from a regular neurologist?",
      "How do I find a certified headache specialist near me?",
      "What should I bring to my first specialist appointment?",
    ],
    questionsForTeam: [
      "Should I see a headache specialist?",
      "Can you provide a referral and help with insurance authorization?",
      "Are there any tests I should have done before the specialist visit?",
    ],
    considerations: "Number of failed treatments, impact on quality of life, insurance referral requirements, geographic access to specialists.",
    additionalResources: [
      "UCNS certified headache specialist directory",
      "American Migraine Foundation: Find a Doctor tool",
    ],
  },

  // Substage: Creating a Treatment Plan
  {
    id: "treat-10",
    title: "Building Your Personal Treatment Plan",
    stage: "Treatment & Management",
    substage: "Creating a Treatment Plan",
    nodeType: "info",
    status: "available",
    description: "Creating a comprehensive, personalized migraine management plan with your doctor.",
    videoTitle: "Creating a Migraine Action Plan",
    aboutStation: "A complete migraine treatment plan includes: an acute treatment protocol (what to take, when, and how), a preventive strategy if indicated, lifestyle modification goals, trigger management, a rescue plan for severe breakthrough attacks, and regular follow-up assessments. The plan should be written down and shared with family and workplace contacts. Goals should be measurable: target headache days per month, disability score, and quality of life metrics.",
    actionToTake: "Work with your doctor to create a written treatment plan. Include your specific acute medication with exact dosing instructions, when to take a second dose, and when to use rescue medication. Define what constitutes a treatment failure and when to call your doctor. Set a follow-up schedule (every 4-6 weeks initially, then every 3-6 months once stable).",
    moreDetails: "Use standardized tools to track your progress: the MIDAS (Migraine Disability Assessment) questionnaire measures disability, HIT-6 (Headache Impact Test) measures functional impact, and a headache calendar tracks attack frequency and medication use. Review and adjust the plan at each visit. Consider a multidisciplinary approach including behavioral therapy, physical therapy, and nutritional counseling.",
    neuroQueryPrompts: [
      "What should a complete migraine treatment plan include?",
      "How do I create a rescue plan for severe attacks?",
      "What tools can help me track my progress?",
    ],
    questionsForTeam: [
      "Can we create a written treatment plan I can follow?",
      "When should I call the office versus go to the emergency room?",
      "How often should I come back for follow-up?",
    ],
    considerations: "Treatment goals, work and family responsibilities, insurance coverage, access to medications and specialists.",
    additionalResources: [
      "American Migraine Foundation: Migraine Treatment Plan template",
      "MIDAS questionnaire (free online)",
    ],
  },
  {
    id: "treat-11",
    title: "Clinical Trials & Emerging Treatments",
    stage: "Treatment & Management",
    substage: "Creating a Treatment Plan",
    nodeType: "info",
    status: "available",
    description: "Exploring participation in migraine research and understanding emerging therapies.",
    videoTitle: "Migraine Research: What's Next? (Migraine Research Foundation)",
    aboutStation: "Migraine research is rapidly advancing with new therapeutic targets including PACAP (pituitary adenylate cyclase-activating peptide), glutamate receptors, and neuromodulation devices. Neuromodulation options (transcranial magnetic stimulation, vagus nerve stimulation, supraorbital nerve stimulation) offer non-pharmacological alternatives. Clinical trials provide access to cutting-edge treatments and contribute to scientific progress.",
    actionToTake: "If standard treatments are inadequate, discuss clinical trial participation with your headache specialist. Visit clinicaltrials.gov to search for migraine trials in your area. Non-invasive neuromodulation devices (Cefaly, SpringTMS, gammaCore) are FDA-cleared and available by prescription for some patients.",
    neuroQueryPrompts: [
      "What new migraine treatments are being developed?",
      "How do neuromodulation devices work for migraine?",
      "What should I consider before joining a clinical trial?",
    ],
    questionsForTeam: [
      "Are there any clinical trials you recommend for my situation?",
      "Am I a candidate for a neuromodulation device?",
      "What emerging treatments are closest to approval?",
    ],
    considerations: "Failed prior treatments, willingness to try experimental therapies, geographic access to research centers, time commitment.",
    additionalResources: [
      "clinicaltrials.gov migraine studies",
      "American Migraine Foundation: Neuromodulation overview",
    ],
  },

  // ============================================
  // LIVING WITH MIGRAINE STAGE
  // ============================================

  // Substage: Lifestyle Modifications
  {
    id: "living-1",
    title: "The SEEDS Approach to Migraine Prevention",
    stage: "Living with Migraine",
    substage: "Lifestyle Modifications",
    nodeType: "entry",
    status: "available",
    description: "Using the SEEDS framework for comprehensive lifestyle-based migraine management.",
    videoTitle: "SEEDS for Migraine Prevention (Headache Center of Excellence)",
    aboutStation: "SEEDS is an evidence-based lifestyle modification framework developed by headache specialists: Sleep (consistent schedule, 7-8 hours), Exercise (150 minutes/week moderate aerobic activity), Eat (regular meals, adequate hydration, limit trigger foods), Diary (consistent headache tracking), and Stress management (relaxation techniques, cognitive behavioral therapy). Studies show that combining lifestyle modifications with medication provides better outcomes than medication alone.",
    actionToTake: "Implement one SEEDS component at a time to avoid feeling overwhelmed. Start with the area that needs the most improvement. Set specific, measurable goals (e.g., 'in bed by 10:30 PM every night' rather than 'sleep better'). Track your progress alongside your headache diary to see the connection between lifestyle changes and migraine frequency.",
    moreDetails: "Each SEEDS component has independent evidence for migraine reduction. Sleep regularity alone can reduce migraines by 25-30%. Regular aerobic exercise is as effective as some preventive medications. Consistent meal timing prevents blood sugar drops that can trigger attacks. Diary keeping improves treatment accuracy. Stress management through CBT or biofeedback reduces attack frequency by 30-50%.",
    neuroQueryPrompts: [
      "Which SEEDS component should I focus on first?",
      "How quickly will lifestyle changes improve my migraines?",
      "Can lifestyle changes replace medication?",
    ],
    questionsForTeam: [
      "How should I prioritize lifestyle modifications?",
      "Can you refer me for behavioral therapy or biofeedback?",
      "Are there apps that help track SEEDS goals alongside headaches?",
    ],
    considerations: "Current lifestyle habits, willingness to change, work and family constraints, comorbid conditions.",
    additionalResources: [
      "American Migraine Foundation: SEEDS for Success",
      "Headache journal: SEEDS evidence review",
    ],
  },
  {
    id: "living-2",
    title: "Tracking Patterns & Using Your Diary",
    stage: "Living with Migraine",
    substage: "Lifestyle Modifications",
    nodeType: "info",
    status: "available",
    description: "Effectively tracking migraine patterns to improve treatment decisions.",
    videoTitle: "How to Keep a Headache Diary That Works",
    aboutStation: "A headache diary is the single most important tool for managing migraine. It reveals patterns invisible to memory alone: trigger correlations, medication effectiveness, hormonal patterns, and lifestyle impacts. Track: date, time of onset and resolution, pain severity (0-10), location, associated symptoms, triggers, medications taken (with timing and response), menstrual cycle day, sleep hours, stress level, and missed work or activities.",
    actionToTake: "Use this app or a dedicated headache diary daily, even on headache-free days (recording absence of headache is valuable data). Review your diary monthly for patterns. Bring your diary to every doctor appointment. After 2-3 months, you will have enough data to identify your top triggers and optimal treatment approach.",
    moreDetails: "Common patterns revealed by diary tracking: menstrual migraine (attacks clustered around menstruation), weekend migraine (letdown headaches from schedule changes), weather-sensitive migraine, and medication overuse patterns. Some patients discover their perceived triggers are actually prodrome symptoms (e.g., chocolate cravings during prodrome, not chocolate as a trigger).",
    neuroQueryPrompts: [
      "What should I record in my headache diary every day?",
      "How do I identify patterns in my diary data?",
      "How long do I need to keep a diary to see meaningful patterns?",
    ],
    questionsForTeam: [
      "Can you help me interpret my headache diary?",
      "What patterns are you seeing in my data?",
      "Should I change anything based on my diary trends?",
    ],
    considerations: "Diary compliance, digital vs paper preference, comprehensiveness vs simplicity, data sharing with provider.",
    additionalResources: [
      "American Migraine Foundation: Headache diary template",
      "National Headache Foundation: Tracking tips",
    ],
  },

  // Substage: Trigger Management
  {
    id: "living-3",
    title: "Trigger Avoidance vs Trigger Management",
    stage: "Living with Migraine",
    substage: "Trigger Management",
    nodeType: "info",
    status: "available",
    description: "Moving beyond strict avoidance toward a balanced approach to trigger management.",
    videoTitle: "Managing Migraine Triggers Without Living in Fear",
    aboutStation: "The traditional approach of strict trigger avoidance can lead to an increasingly restricted life and heightened anxiety around triggers. Modern headache medicine recommends a balanced approach: avoid clear, consistent triggers (e.g., known food triggers, alcohol) but build resilience against unpredictable triggers (weather, stress) through lifestyle regularity, preventive medication, and coping strategies. The goal is management, not total avoidance.",
    actionToTake: "Categorize your triggers into modifiable (sleep, meals, hydration, stress) and non-modifiable (weather, hormones). Focus energy on modifiable triggers. For non-modifiable triggers, have your acute medication ready and a coping plan in place. Gradually reintroduce suspected food triggers one at a time to test whether they are true triggers.",
    moreDetails: "Trigger stacking is a useful concept: a single trigger may not provoke an attack, but multiple triggers occurring simultaneously can cross the threshold. Managing modifiable factors (regular sleep, meals, stress) raises the threshold, making you more resilient against non-modifiable triggers. Cognitive behavioral therapy for migraine specifically addresses trigger-related anxiety and avoidance behavior.",
    neuroQueryPrompts: [
      "Am I being too restrictive with my trigger avoidance?",
      "How do I test whether a food is actually a trigger?",
      "What is the trigger threshold model?",
    ],
    questionsForTeam: [
      "Should I follow a strict elimination diet or a more flexible approach?",
      "How can I manage triggers I cannot avoid (weather, hormones)?",
      "Would cognitive behavioral therapy help with trigger anxiety?",
    ],
    considerations: "Degree of lifestyle restriction, anxiety levels, social impact of avoidance, availability of CBT.",
    additionalResources: [
      "American Migraine Foundation: Rethinking Migraine Triggers",
      "Headache journal: Trigger management evidence review",
    ],
  },
  {
    id: "living-4",
    title: "Hormonal Migraine Management",
    stage: "Living with Migraine",
    substage: "Trigger Management",
    nodeType: "info",
    status: "available",
    description: "Managing menstrual and hormone-related migraine patterns.",
    videoTitle: "Hormonal Migraine: Causes and Solutions (AMF)",
    aboutStation: "Menstrual migraine affects up to 60% of women with migraine. Attacks are triggered by the natural drop in estrogen levels in the late luteal phase (2 days before through 3 days after menstruation onset). Menstrual migraines tend to be longer, more severe, and less responsive to treatment than non-menstrual attacks. Pure menstrual migraine occurs only around menstruation, while menstrually-related migraine occurs both at menstruation and at other times.",
    actionToTake: "Track your headache diary alongside your menstrual cycle for at least 3 months to confirm the pattern. Mini-prevention strategies include: scheduled frovatriptan (2.5mg twice daily starting 2 days before expected menses for 6 days), naproxen sodium (550mg twice daily during the vulnerable window), or continuous low-dose estrogen supplementation during the drop. Discuss options with your doctor.",
    moreDetails: "Oral contraceptive choices matter: continuous combined pills (skipping placebo weeks) can stabilize estrogen levels and reduce menstrual migraine. However, estrogen-containing contraceptives are relatively contraindicated in migraine with aura due to increased stroke risk. Progestin-only methods are an alternative. During perimenopause, fluctuating hormones may worsen migraine before it improves after menopause. Pregnancy often improves migraine, especially in the second and third trimesters.",
    neuroQueryPrompts: [
      "How do I confirm my migraines are hormone-related?",
      "Can birth control help or worsen my migraines?",
      "Will my migraines improve after menopause?",
    ],
    questionsForTeam: [
      "What mini-prevention strategy do you recommend for my menstrual migraines?",
      "Should I change my contraceptive method?",
      "How do we manage migraines during perimenopause?",
    ],
    considerations: "Menstrual pattern regularity, aura status (affects contraceptive safety), pregnancy planning, perimenopausal status.",
    additionalResources: [
      "American Migraine Foundation: Hormonal Migraine Guide",
      "National Headache Foundation: Women and Migraine",
    ],
  },

  // Substage: Sleep & Stress
  {
    id: "living-5",
    title: "Sleep Hygiene for Migraine",
    stage: "Living with Migraine",
    substage: "Sleep & Stress",
    nodeType: "info",
    status: "available",
    description: "Optimizing sleep to reduce migraine frequency and severity.",
    videoTitle: "Sleep and Migraine: The Critical Connection",
    aboutStation: "Sleep and migraine share overlapping brain pathways. Both too little and too much sleep can trigger attacks. Irregular sleep schedules (including sleeping in on weekends) are a top modifiable trigger. Insomnia, sleep apnea, and restless legs syndrome are more common in people with migraine and can worsen headache frequency. Cognitive behavioral therapy for insomnia (CBT-I) is the first-line treatment for insomnia and has been shown to reduce migraine frequency.",
    actionToTake: "Establish a consistent sleep-wake schedule: go to bed and wake up at the same time every day, including weekends (within 30 minutes). Aim for 7-8 hours. Create a wind-down routine (dim lights, avoid screens 1 hour before bed, relaxation exercises). Keep the bedroom cool, dark, and quiet. Avoid caffeine after noon. If you snore or feel unrested despite adequate sleep hours, discuss screening for sleep apnea.",
    moreDetails: "The weekend migraine or Monday migraine phenomenon is often caused by sleeping in on days off — the change in sleep schedule disrupts the brain's circadian rhythm. Napping can be helpful during a migraine attack but should be limited to 20-30 minutes otherwise. Melatonin (3mg at bedtime) has some evidence for migraine prevention and may help regulate the sleep-wake cycle.",
    neuroQueryPrompts: [
      "How important is a consistent wake time for migraine?",
      "Can napping make my migraines better or worse?",
      "Should I try melatonin for sleep and migraine?",
    ],
    questionsForTeam: [
      "Should I be screened for sleep apnea?",
      "Can you refer me for CBT-I?",
      "Is there a connection between my sleep medications and my migraines?",
    ],
    considerations: "Current sleep habits, work schedule (shift work), sleep disorder symptoms, caffeine use, screen time habits.",
    additionalResources: [
      "American Migraine Foundation: Sleep and Migraine",
      "National Sleep Foundation: Sleep Hygiene recommendations",
    ],
  },
  {
    id: "living-6",
    title: "Stress Management & Behavioral Therapy",
    stage: "Living with Migraine",
    substage: "Sleep & Stress",
    nodeType: "info",
    status: "available",
    description: "Evidence-based stress reduction and behavioral approaches for migraine.",
    videoTitle: "CBT and Biofeedback for Migraine (AMF)",
    aboutStation: "Stress is the most commonly reported migraine trigger. Interestingly, the letdown period after stress (not the stress itself) often triggers attacks. Cognitive behavioral therapy (CBT) for migraine teaches patients to identify and change thought patterns and behaviors that worsen migraine. Biofeedback uses real-time physiological monitoring (muscle tension, skin temperature) to teach voluntary relaxation. Progressive muscle relaxation and mindfulness meditation also have evidence for migraine reduction. These behavioral approaches reduce migraine frequency by 30-50%, comparable to preventive medications.",
    actionToTake: "Practice a relaxation technique daily, even on headache-free days — this builds the skill so it works when you need it. Start with 10 minutes of progressive muscle relaxation or diaphragmatic breathing. Ask your doctor for referral to a psychologist trained in behavioral headache management. Consider mindfulness-based stress reduction (MBSR) programs, which have specific evidence for migraine.",
    moreDetails: "CBT for migraine is different from general CBT for anxiety or depression. It specifically addresses: unhelpful thoughts about migraine and triggers, avoidance behavior, catastrophizing about attacks, pacing activity levels, and managing the emotional burden of chronic illness. Biofeedback-assisted relaxation may be covered by insurance when performed by a licensed psychologist or therapist. Virtual and app-based programs are increasingly available.",
    neuroQueryPrompts: [
      "Is my migraine made worse by stress or by my response to stress?",
      "What is the difference between CBT and regular counseling for migraine?",
      "How do I find a therapist trained in behavioral headache management?",
    ],
    questionsForTeam: [
      "Can you refer me for CBT or biofeedback for migraine?",
      "Are virtual behavioral therapy programs effective?",
      "Can behavioral therapy replace medication or should it be combined?",
    ],
    considerations: "Access to trained therapists, insurance coverage, time commitment, willingness to practice daily, virtual vs in-person preference.",
    additionalResources: [
      "Association for Applied Psychophysiology and Biofeedback (AAPB)",
      "American Migraine Foundation: Behavioral Treatments",
    ],
  },

  // Substage: Diet & Exercise
  {
    id: "living-7",
    title: "Diet, Hydration & Migraine",
    stage: "Living with Migraine",
    substage: "Diet & Exercise",
    nodeType: "info",
    status: "available",
    description: "Optimizing nutrition and hydration to reduce migraine frequency.",
    videoTitle: "Diet and Migraine: What the Evidence Says",
    aboutStation: "Regular meal timing is more important than specific food avoidance for most migraine patients. Skipping meals and fasting are reliable triggers due to blood sugar drops. Dehydration is a common overlooked trigger — aim for at least 8 glasses (64 oz) of water daily. Caffeine has a complex relationship with migraine: moderate consistent intake (1-2 cups coffee/day) can be protective, but variable intake or overuse (3+ cups/day) increases headache risk. Common dietary triggers include alcohol (especially red wine), aged cheeses, processed meats with nitrates, MSG, and artificial sweeteners — but only in a subset of patients.",
    actionToTake: "Eat regular meals every 4-5 hours without skipping. Carry water and drink throughout the day. Keep caffeine intake consistent and moderate. Do not implement a broad elimination diet without guidance — instead, test one suspected food trigger at a time using your diary. Consider a Mediterranean-style diet rich in omega-3 fatty acids, fruits, vegetables, and whole grains, which has anti-inflammatory properties.",
    moreDetails: "Supplements with evidence for migraine prevention include: magnesium (400-600mg/day, particularly magnesium oxide or citrate), riboflavin/vitamin B2 (400mg/day), CoQ10 (100mg three times daily), and feverfew. These are generally safe with few side effects and can complement medication. Discuss with your doctor before starting. The Heal Your Headache (HYH) elimination diet is popular but not strongly evidence-based — a targeted approach guided by your diary is preferred.",
    neuroQueryPrompts: [
      "Do I need to follow a special diet for migraine?",
      "How much water should I drink to prevent migraines?",
      "Are supplements like magnesium effective for migraine?",
    ],
    questionsForTeam: [
      "Should I try an elimination diet?",
      "Do you recommend any supplements for migraine?",
      "Should I cut out caffeine completely?",
    ],
    considerations: "Current dietary habits, caffeine consumption, hydration status, food allergy/intolerance history, supplement interactions with medications.",
    additionalResources: [
      "American Migraine Foundation: Diet and Migraine",
      "National Headache Foundation: Nutrition and Headache",
    ],
  },
  {
    id: "living-8",
    title: "Exercise & Physical Activity",
    stage: "Living with Migraine",
    substage: "Diet & Exercise",
    nodeType: "info",
    status: "available",
    description: "Using regular exercise as a migraine prevention strategy.",
    videoTitle: "Exercise and Migraine: How to Get Started Safely",
    aboutStation: "Regular aerobic exercise is one of the most effective non-pharmacological migraine preventives. A landmark Swedish study showed that 40 minutes of cycling three times per week reduced migraine frequency equivalently to topiramate. Exercise releases endorphins, reduces stress hormones, improves sleep, and regulates serotonin pathways. However, intense or unfamiliar exercise can trigger attacks in some people, especially when dehydrated or in hot conditions.",
    actionToTake: "Start slowly if you are sedentary — begin with 20 minutes of moderate walking three times per week and gradually increase to 150 minutes per week of moderate aerobic activity (brisk walking, swimming, cycling). Always warm up gradually. Stay hydrated before, during, and after exercise. If exercise triggers headaches, try lower-intensity activities, exercising in cool environments, and warming up for at least 15 minutes.",
    moreDetails: "Yoga has specific evidence for migraine reduction through combined physical activity, breathing exercises, and stress reduction. High-intensity interval training (HIIT) may trigger attacks in some people — moderate steady-state exercise is generally safer. Neck and shoulder strengthening exercises are beneficial for patients with cervicogenic contributions to their migraine. A physical therapist can design a safe exercise program if you are concerned about exercise-triggered attacks.",
    neuroQueryPrompts: [
      "What type of exercise is best for migraine prevention?",
      "Why does exercise sometimes trigger my migraines?",
      "Can yoga or tai chi help reduce migraine frequency?",
    ],
    questionsForTeam: [
      "How should I start an exercise program safely?",
      "Should I exercise during a migraine attack?",
      "Can you refer me to a physical therapist who understands migraine?",
    ],
    considerations: "Current fitness level, exercise-triggered migraine history, other health conditions, access to exercise facilities, motivation.",
    additionalResources: [
      "American Migraine Foundation: Exercise and Migraine",
      "Migraine Research Foundation: Physical Activity evidence",
    ],
  },

  // Substage: Work & Daily Life
  {
    id: "living-9",
    title: "Workplace Accommodations & Productivity",
    stage: "Living with Migraine",
    substage: "Work & Daily Life",
    nodeType: "info",
    status: "available",
    description: "Managing migraine in the workplace and understanding your rights.",
    videoTitle: "Migraine at Work: Your Rights and Strategies",
    aboutStation: "Migraine is the leading cause of lost productivity in the working-age population. In the US, the Americans with Disabilities Act (ADA) may entitle migraine patients to reasonable workplace accommodations. Common accommodations include: flexible scheduling, ability to work from home during attacks, a quiet or dimly lit workspace, screen filters to reduce glare, permission to take breaks for medication, and adjusting fluorescent lighting. Disclosing migraine to an employer is a personal decision, but it is required if you are requesting formal accommodations.",
    actionToTake: "Assess how migraine affects your work productivity using the MIDAS questionnaire. If migraines significantly impact your work, consider discussing accommodations with HR. You can request accommodations without disclosing your specific diagnosis — you only need documentation from your doctor that you have a medical condition requiring modifications. Keep acute medication at your desk. Plan high-priority tasks for your best times and have a backup plan for attack days.",
    moreDetails: "Presenteeism (reduced productivity while at work during an attack) may cost more than absenteeism. Strategies to manage attacks at work: treat immediately when symptoms start, take a 20-minute break in a quiet dark room if possible, use ice packs and hydration, and consider whether working from home would allow you to manage the attack better. For severe or frequent migraines, FMLA (Family and Medical Leave Act) may provide job-protected leave for medical appointments and severe attack days.",
    neuroQueryPrompts: [
      "What workplace accommodations are available for migraine?",
      "Should I tell my employer about my migraine?",
      "How do I request accommodations without stigma?",
    ],
    questionsForTeam: [
      "Can you provide documentation for workplace accommodation?",
      "What does the MIDAS score tell me about my disability level?",
      "Should I apply for FMLA or disability benefits?",
    ],
    considerations: "Job demands, workplace culture, relationship with employer, legal protections in your jurisdiction, financial implications.",
    additionalResources: [
      "American Migraine Foundation: Migraine at Work",
      "Job Accommodation Network (JAN): Migraine accommodations",
    ],
  },
  {
    id: "living-10",
    title: "MIDAS Disability Assessment",
    stage: "Living with Migraine",
    substage: "Work & Daily Life",
    nodeType: "info",
    status: "available",
    description: "Using the MIDAS questionnaire to measure migraine-related disability.",
    videoTitle: "Understanding Your MIDAS Score",
    aboutStation: "The MIDAS (Migraine Disability Assessment) is a validated 5-question tool that measures the impact of migraine on your life over the past 3 months. It asks about days of missed work or school, days of reduced productivity at work or school, and days of missed household or social activities. MIDAS scores are graded: Grade I (0-5, minimal disability), Grade II (6-10, mild disability), Grade III (11-20, moderate disability), Grade IV (21+, severe disability). Your MIDAS score helps your doctor determine whether your treatment is adequate and whether to escalate care.",
    actionToTake: "Complete the MIDAS questionnaire every 3 months and bring results to your appointments. If your MIDAS score is Grade III or IV, discuss whether your current treatment plan is adequate. Use MIDAS to track improvement over time after starting new treatments. A decreasing MIDAS score is a meaningful sign that treatment is working.",
    moreDetails: "MIDAS is widely accepted by insurance companies as documentation of migraine severity and treatment need. A MIDAS score of 21+ (Grade IV) strengthens the case for advanced treatments like CGRP therapies or Botox. The HIT-6 (Headache Impact Test) is a complementary tool that measures how headache affects daily function on a per-attack basis, while MIDAS measures cumulative disability over 3 months.",
    neuroQueryPrompts: [
      "What does my MIDAS score mean?",
      "How often should I retake the MIDAS?",
      "What score indicates I need more aggressive treatment?",
    ],
    questionsForTeam: [
      "Is my MIDAS score concerning?",
      "Can my MIDAS score help with insurance approval for treatments?",
      "How do we use the MIDAS to guide treatment decisions?",
    ],
    considerations: "Accuracy of self-reporting, changes over time, use for insurance documentation, comparison with clinical assessment.",
    additionalResources: [
      "MIDAS questionnaire (free, validated tool)",
      "American Headache Society: MIDAS scoring guide",
    ],
  },
  {
    id: "living-11",
    title: "Building Your Support System",
    stage: "Living with Migraine",
    substage: "Work & Daily Life",
    nodeType: "info",
    status: "available",
    description: "Creating a support network and managing the emotional burden of chronic migraine.",
    videoTitle: "Living Well with Migraine: Support and Community",
    aboutStation: "Chronic migraine can lead to isolation, guilt, anxiety, and depression. Building a support system is essential for long-term well-being. This includes: educating family and friends about migraine (it is not just a headache), joining patient communities and support groups, working with mental health professionals, and developing self-compassion practices. People with migraine have a 2-5 times higher risk of depression and anxiety compared to the general population. These comorbidities worsen migraine and should be treated concurrently.",
    actionToTake: "Share educational materials about migraine with your close family and friends. Join an online or in-person migraine support community. If you experience persistent sadness, guilt, or anxiety about your migraines, talk to your doctor about mental health support. Practice self-compassion — migraine is a neurological disease, not a character flaw or sign of weakness.",
    moreDetails: "Resources for building community include the American Migraine Foundation, Miles for Migraine events, and online communities like the Migraine subreddit and various Facebook support groups. Couples counseling can help partners understand the impact of migraine on relationships and develop strategies for managing attacks together. Children of migraine parents benefit from age-appropriate explanations of the condition.",
    neuroQueryPrompts: [
      "How do I explain migraine to family members who do not understand?",
      "Is my depression related to my migraine or separate?",
      "Where can I find migraine support groups?",
    ],
    questionsForTeam: [
      "Can you screen me for depression and anxiety?",
      "Should I see a therapist who specializes in chronic pain?",
      "Are there local migraine support groups you recommend?",
    ],
    considerations: "Social support availability, mental health status, relationship impacts, cultural attitudes toward chronic illness.",
    additionalResources: [
      "American Migraine Foundation: Support and Community",
      "National Alliance on Mental Illness (NAMI): Chronic Illness and Mental Health",
    ],
  },
  {
    id: "living-12",
    title: "Am I Managing Well?",
    stage: "Living with Migraine",
    substage: "Work & Daily Life",
    nodeType: "choice",
    status: "available",
    description: "Self-assessing whether your current migraine management plan is working.",
    aboutStation: "Periodically assess your migraine management: Are your attack days decreasing? Is your MIDAS score improving? Are you able to function at work and home? Are side effects manageable? Are you avoiding medication overuse? Is your quality of life acceptable? If the answer to most of these is yes, your plan is working. If not, it is time to reassess and adjust.",
    actionToTake: "Yes (managing well): Continue current plan. Review every 3-6 months. Gradually optimize lifestyle factors. Consider whether preventive medication can eventually be tapered. No (not managing well): Schedule an appointment to reassess. Bring your updated headache diary and MIDAS score. Discuss whether to switch medications, add behavioral therapy, or seek specialist referral.",
    moreDetails: "Treatment goals should be realistic: a 50% reduction in attack frequency is considered a good response to preventive treatment. Complete elimination of migraines is uncommon. Improving quality of life — through better acute treatment, reduced disability, and emotional well-being — is as important as reducing headache days. Reassess the plan comprehensively before making major changes.",
    neuroQueryPrompts: [
      "What are realistic treatment goals for migraine?",
      "When can I try tapering my preventive medication?",
      "How do I know when my treatment plan needs to change?",
    ],
    questionsForTeam: [
      "Is my current improvement adequate or should we do more?",
      "Can we simplify my medication regimen?",
      "What are my options if I want to try tapering preventive treatment?",
    ],
    considerations: "Current headache frequency vs baseline, quality of life metrics, medication burden, side effect tolerance, patient satisfaction.",
    additionalResources: [
      "American Migraine Foundation: Evaluating Your Treatment Plan",
      "Migraine Trust: Living Well with Migraine",
    ],
  },
];

// Get the current user stage (first one marked as userIsHere, otherwise first available)
export const getCurrentLesson = (): LessonNode | undefined => {
  return allLessons.find((lesson) => lesson.userIsHere) || allLessons.find((lesson) => lesson.status === "available");
};

// Get today's lesson based on current progress
export const getTodaysLesson = (): LessonNode => {
  const current = getCurrentLesson();
  return current || allLessons[0];
};

// Get lessons by stage
export const getLessonsByStage = (stage: string): LessonNode[] => {
  return allLessons.filter((lesson) => lesson.stage === stage);
};

// Get lessons by substage
export const getLessonsBySubstage = (stage: string, substage: string): LessonNode[] => {
  return allLessons.filter((lesson) => lesson.stage === stage && lesson.substage === substage);
};

// Get substages for a stage
export const getSubstagesForStage = (stage: string): string[] => {
  return substages[stage] || [];
};

// Get node type icon
export const getNodeTypeLabel = (nodeType: NodeType): string => {
  switch (nodeType) {
    case "entry": return "Entry Point";
    case "choice": return "Decision Point";
    case "info": return "Information";
    case "subsection": return "Section";
  }
};
