import React, { useState } from 'react';
import PropTypes from 'prop-types';

function Chatbot({ onClose }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedSubOption, setSelectedSubOption] = useState(null);
  const [previousOptions, setPreviousOptions] = useState([]); // Track previous options

  const handleOptionClick = (option) => {
    setPreviousOptions([...previousOptions, selectedOption]); // Store the previous selected option
    setSelectedOption(option);
    setSelectedSubOption(null);

    // Check if the selected option is the specific subquestion
    if (option === 'At what age do early signs of autism typically appear?') {
      // Display the specific message for this subquestion
      setSelectedSubOption(' Early signs of autism typically appear in children around the age of 2 or earlier. However, its important to note that the exact age at which these signs become noticeable can vary from child to child. Some children may exhibit early signs as early as 12 to 18 months of age, while others may show them closer to age 2 or even later. Common early signs of autism can include: Social Challenges: Difficulty making eye contact. Limited interest in or engagement with others. Difficulty with social interactions, such as sharing attention or playing with peers. Communication Difficulties: Delayed or absent speech development. Limited or repetitive use of language (echolalia). Difficulty in understanding and using non-verbal communication, like gestures and facial expressions. Repetitive Behaviors: Engaging in repetitive and stereotypical movements or actions (e.g., hand-flapping, rocking). Insistence on sameness or routines. Sensory Sensitivities: Heightened or diminished sensitivity to sensory stimuli (e.g., sensitivity to lights, sounds, textures). Unusual responses to sensory experiences. Its important to remember that early signs of autism may not always be immediately recognized, and some children may develop typically in their early years but exhibit signs later on. Early intervention and assessment by healthcare professionals are crucial for identifying and addressing autism spectrum disorder (ASD) as early as possible to provide appropriate support and services. If you have concerns about a childs development, its advisable to consult with a pediatrician or a developmental specialist.');
    } else if (option === 'What social communication difficulties should I look out for?') {
      // Display the specific message for this subquestion
      setSelectedSubOption('Social communication difficulties are a hallmark feature of autism spectrum disorder (ASD). When looking out for social communication difficulties in individuals, especially children, you may observe several key signs and challenges. Its important to note that not all individuals with ASD will exhibit the same difficulties, and the severity of these challenges can vary. Here are some common social communication difficulties to watch for: Limited Eye Contact: Many individuals with ASD may have difficulty making and maintaining eye contact during social interactions. They may avert their gaze or avoid looking directly into someones eyes. Difficulty with Nonverbal Communication: Children with ASD might struggle with nonverbal cues, such as facial expressions, gestures, and body language. They may have difficulty understanding the meaning of these cues in others and may not use them effectively to convey their own feelings or intentions. Delayed or Atypical Speech Development: Some individuals with ASD may experience delays in speech and language development. Others may exhibit atypical speech patterns, such as echolalia (repeating words or phrases) or using overly formal language. Limited Conversational Skills: Engaging in conversations and maintaining back-and-forth exchanges can be challenging for individuals with ASD. They may have difficulty initiating conversations, staying on topic, or understanding the rules of conversation, such as taking turns. Difficulty Understanding Social Norms: Individuals with ASD may struggle to grasp unwritten social rules and norms. This includes understanding appropriate personal space, recognizing sarcasm or humor, or knowing when and how to greet others. Difficulty with Empathy: Some individuals with ASD may find it challenging to empathize with others and understand their emotions. They may not respond to the emotional cues or needs of others in a typical manner. Limited Interest in Social Interactions: Children with ASD may show a reduced interest in engaging with others or forming social relationships. They may prefer solitary activities or have a more narrow range of interests. Repetitive or Stereotyped Behaviors: Repetitive behaviors, such as hand-flapping, rocking, or fixation on certain objects or topics, can interfere with social interactions and communication. Difficulty with Theory of Mind: Theory of Mind refers to the ability to understand that others have thoughts, beliefs, and perspectives different from ones own. Individuals with ASD may struggle with this concept, making it challenging for them to understand the perspectives and intentions of others. Sensory Sensitivities: Sensory sensitivities can affect social interactions. Some individuals with ASD may be hypersensitive or hyposensitive to sensory stimuli (e.g., lights, sounds, textures), leading to discomfort or withdrawal in social situations. Its essential to remember that these difficulties can vary widely among individuals with ASD, and not everyone will exhibit all of these challenges. Additionally, early intervention and support can significantly improve social communication skills in individuals with ASD.');
    } else if (option === 'Are repetitive behaviors an early sign of autism?') {
      // Display the specific message for this subquestion
      setSelectedSubOption('Yes, repetitive behaviors can be an early sign of autism spectrum disorder (ASD). These repetitive behaviors are often referred to as "stereotyped" or "restricted" behaviors. While they can manifest differently in each individual, some common examples include hand-flapping, rocking, repeating certain words or phrases (echolalia), and an insistence on sameness or routines. Its important to note that not all children who exhibit repetitive behaviors will have ASD, as these behaviors can also occur in typically developing children or in individuals with other developmental conditions. However, when repetitive behaviors are observed in conjunction with other early signs of autism, such as social communication challenges and delayed language development, they may raise concerns and warrant further evaluation by healthcare professionals. Early identification and intervention are crucial for children with ASD, as it allows for appropriate support and services to be provided to address their specific needs.');
    } else if (option === 'How do sensory sensitivities manifest in young children with autism?') {
      // Display the specific message for this subquestion
      setSelectedSubOption('Sensory sensitivities in young children with autism can manifest in various ways. Sensory sensitivities refer to atypical reactions or responses to sensory stimuli such as lights, sounds, textures, tastes, and smells. These sensitivities can affect how children perceive and interact with their environment. Here are some common ways sensory sensitivities may manifest in young children with autism: Hypersensitivity (Over-Responsiveness): Auditory Hypersensitivity: Some children with autism may be highly sensitive to sounds. They may cover their ears, become distressed, or have strong negative reactions to seemingly ordinary noises, such as a vacuum cleaner, sirens, or background chatter. Visual Hypersensitivity: Bright lights, flashing lights, or certain patterns may be overwhelming for some children with autism. They may prefer dimly lit environments and may be bothered by fluorescent lighting or intense sunlight. Tactile Hypersensitivity: Some children may be sensitive to textures and tactile sensations. They may find certain fabrics uncomfortable, avoid touching specific materials, or resist activities like finger painting or playing in sand. Hyposensitivity (Under-Responsiveness): Oral Hyposensitivity: Children with autism may have limited sensitivity to taste and texture in their mouths. This can lead to eating difficulties, as they may prefer only a narrow range of foods with familiar textures. Tactile Hyposensitivity: Conversely, some children may have reduced sensitivity to pain or temperature changes. They might not react to minor injuries or discomfort, potentially putting themselves at risk. Avoidance Behaviors: Children with sensory sensitivities may actively avoid situations or environments that trigger their sensitivities. For example, they may avoid noisy places, crowded areas, or places with strong odors. Repetitive Self-Stimulatory Behaviors: Children with autism may engage in repetitive behaviors (stimming) to self-regulate and cope with sensory sensitivities. Stimming behaviors like hand-flapping, rocking, or tapping can help them modulate sensory input. Emotional Reactions: Sensory sensitivities can lead to emotional responses such as anxiety, frustration, or distress. A seemingly minor sensory trigger can cause a strong emotional reaction in some children. Sensory Seeking: While some children with autism are hypersensitive and avoid sensory input, others may actively seek out sensory experiences. They might spin, jump, or seek tactile stimulation to meet their sensory needs. Difficulty with Transitions: Changes in sensory input, such as transitioning from a quiet room to a noisy one, can be challenging for children with sensory sensitivities. This may lead to difficulty adapting to new environments or routines. Its important to remember that sensory sensitivities can vary widely among individuals with autism. Not all children will experience the same sensitivities, and the intensity of their responses can differ. Recognizing and understanding these sensitivities is crucial for caregivers, educators, and therapists to provide appropriate support and create sensory-friendly environments for children with autism.');
    } else if (option === 'What professionals are involved in the diagnosis of autism?') {
      // Display the specific message for this subquestion
      setSelectedSubOption('The diagnosis of autism typically involves a multidisciplinary team of professionals who work together to assess and evaluate a childs developmental and behavioral characteristics. The specific professionals involved in the diagnosis of autism may vary depending on the healthcare system, location, and available resources. However, here are the key professionals who are commonly part of the diagnostic process: Pediatrician or Family Doctor: A pediatrician or family doctor is often the first point of contact for parents who have concerns about their childs development. They can conduct initial screenings, monitor growth and development, and provide referrals to specialists for further evaluation. Child Psychologist or Developmental Psychologist: Psychologists with expertise in child development and behavior can play a crucial role in assessing a childs cognitive and emotional functioning. They may conduct standardized assessments and interviews with parents and caregivers to gather information about the childs behavior and developmental history. Child Psychiatrist: Child psychiatrists are medical doctors who specialize in diagnosing and treating mental health conditions in children and adolescents. They may be consulted to evaluate the presence of any comorbid psychiatric conditions that can co-occur with autism. Pediatric Neurologist: Pediatric neurologists are medical doctors who specialize in the nervous system and its disorders. They may be involved in cases where there are neurological symptoms or concerns related to the childs development. Speech-Language Pathologist: Speech-language pathologists assess a childs communication skills, including speech, language, and social communication abilities. They can identify language delays, speech disorders, and difficulties in pragmatic language (social use of language). Occupational Therapist: Occupational therapists assess a childs sensory processing, fine motor skills, and daily living skills. They can help identify sensory sensitivities and motor coordination challenges that are often associated with autism. Physical Therapist: Physical therapists assess and address motor skills, balance, and coordination. They may be involved if there are concerns related to gross motor development. Developmental Pediatrician: Developmental pediatricians are medical doctors who specialize in child development and behavior. They have expertise in diagnosing developmental disorders, including autism, and can provide comprehensive evaluations. Educational Specialists: Teachers, special education professionals, or school psychologists may be involved in the diagnostic process, especially when assessing a childs academic and social functioning within an educational setting. Genetic Counselor: In some cases, genetic testing may be recommended to identify any underlying genetic factors or syndromes that could be contributing to a childs developmental challenges. Autism Specialists or Clinicians: Some healthcare institutions have specialized autism diagnostic teams or clinics that include professionals with expertise in autism spectrum disorder. These teams often provide comprehensive assessments and recommendations for intervention and support. Clinical Social Workers or Counselors: These professionals can provide counseling and support to parents and caregivers during the diagnostic process and help connect families with resources and services. Its important to note that a thorough autism evaluation may include medical assessments, psychological assessments, observations of the childs behavior, and interviews with parents or caregivers. A comprehensive assessment by a multidisciplinary team can lead to a more accurate and holistic understanding of the childs strengths and challenges and guide intervention planning.');
    } else if (option === 'What criteria are used for diagnosing autism?') {
      // Display the specific message for this subquestion
      setSelectedSubOption('The diagnosis of autism spectrum disorder (ASD) typically involves a comprehensive assessment by a team of healthcare professionals. The specific criteria used for diagnosing autism may vary slightly based on the diagnostic criteria adopted, but the most commonly used criteria are from the Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition (DSM-5) and the International Classification of Diseases, Tenth Revision (ICD-10 or ICD-11, depending on the region).');
    } else if (option === 'What is Applied Behavior Analysis (ABA) therapy?') {
      // Display the specific message for this subquestion
      setSelectedSubOption('Applied Behavior Analysis (ABA) therapy is a structured and evidence-based approach to understanding and modifying behavior, with a primary focus on improving socially significant behaviors. It is widely used as an effective intervention for individuals with autism spectrum disorder (ASD) and other developmental or behavioral disorders. ABA therapy is based on the principles of behaviorism and employs systematic techniques to bring about meaningful and positive changes in behavior and learning. Here are key components and principles of ABA therapy: Behavioral Assessment: ABA begins with a comprehensive assessment of the individuals behavior and skills. This assessment helps identify the specific behaviors that need to be targeted for improvement, as well as the factors that contribute to those behaviors. Data collection and analysis are essential throughout the therapy process to track progress accurately. Behavioral Goals: ABA therapy sets clear and measurable behavioral goals. These goals are individualized to address the unique needs and challenges of the person receiving therapy. Goals may include improving communication skills, reducing challenging behaviors, and enhancing social interactions. Functional Behavior Analysis (FBA): FBA is a core component of ABA therapy. It involves identifying the antecedents (what happens before a behavior occurs), the behavior itself, and the consequences (what happens after the behavior). FBA helps determine the function or purpose of the behavior, such as escaping a demand, seeking attention, or obtaining a desired item. Applied Interventions: ABA therapists develop and implement interventions and strategies tailored to the individuals needs. These interventions are designed to teach new skills, improve existing ones, and reduce challenging behaviors. ABA techniques may include prompting, shaping, reinforcement, and systematic desensitization, among others. Data Collection and Analysis: ABA relies on systematic data collection to measure progress and make data-driven decisions. Data are gathered during therapy sessions to assess whether the individual is meeting their behavioral goals. This information guides adjustments to the intervention plan. Positive Reinforcement: ABA emphasizes the use of positive reinforcement to encourage desired behaviors. When individuals engage in target behaviors or achieve goals, they are rewarded with preferred items, activities, or praise. This reinforcement helps motivate individuals to continue displaying positive behaviors. Generalization and Maintenance: ABA aims to ensure that newly acquired skills generalize to various settings, people, and situations. Maintenance of skills over time is also a focus of therapy, as individuals should continue to use and benefit from these skills in the long term. ABA Providers: ABA therapy is typically delivered by trained and certified professionals known as Board Certified Behavior Analysts (BCBAs) or Board Certified Assistant Behavior Analysts (BCaBAs). These professionals design and oversee individualized treatment plans and provide guidance to therapy teams. Collaboration with Caregivers: ABA therapy involves close collaboration with caregivers, parents, and other caregivers. They are an integral part of the therapy process and are often trained to implement ABA techniques and strategies consistently in the home environment. Ethical Considerations: ABA therapy adheres to a strict code of ethics, prioritizing the well-being and dignity of the individual. Treatment is based on the principles of beneficence and non-maleficence, meaning that therapy aims to benefit the individual and avoid harm. ABA therapy has been effective in improving a wide range of skills and behaviors in individuals with autism, including communication, social interaction, academic skills, and daily living skills. It is often recommended as an early intervention for children with autism, but it can also be beneficial for individuals of all ages. The intensity and duration of ABA therapy can vary based on individual needs and goals.');
    } else if (option === 'Are there alternative therapies to ABA?') {
      // Display the specific message for this subquestion
      setSelectedSubOption('Yes, there are alternative therapies and interventions for individuals with autism spectrum disorder (ASD) that complement or serve as alternatives to Applied Behavior Analysis (ABA) therapy. Its important to recognize that the effectiveness of these therapies can vary widely among individuals, and what works best may depend on an individuals unique strengths, needs, and preferences. Here are some alternative therapies and interventions often considered in the autism community: Speech Therapy: Speech therapy, also known as speech-language therapy, focuses on improving communication skills, including speech, language, and social communication abilities. It can help individuals with autism develop functional communication, improve articulation, and enhance social communication. Occupational Therapy: Occupational therapy addresses sensory processing challenges, fine motor skills, and daily living skills. It can help individuals with autism improve their ability to engage in everyday activities, such as dressing, eating, and self-care, and manage sensory sensitivities. Physical Therapy: Physical therapy is designed to address gross motor skills, balance, coordination, and physical fitness. It may be beneficial for individuals with autism who have motor difficulties or delays. Social Skills Training: Social skills training programs focus on teaching individuals with autism essential social and communication skills. These programs often use structured and systematic approaches to help individuals understand social norms, engage in conversations, and build relationships. Cognitive Behavioral Therapy (CBT): CBT is a form of talk therapy that can help individuals with autism manage anxiety, obsessive-compulsive behaviors, and emotional regulation. It focuses on identifying and changing negative thought patterns and behaviors. Developmental Therapies: Developmental therapies, such as the Developmental, Individual Difference, Relationship-based (DIR) Floortime approach and the Relationship Development Intervention (RDI), emphasize building emotional and social connections between individuals with autism and their caregivers. These therapies often involve play-based interactions. Music Therapy: Music therapy uses music as a therapeutic tool to address various goals, including improving communication, self-expression, and emotional regulation. It can be engaging and enjoyable for individuals with autism. Art Therapy: Art therapy provides individuals with autism a creative outlet for self-expression and emotional regulation. It can help individuals communicate and process their thoughts and feelings through art. Sensory Integration Therapy: Sensory integration therapy aims to address sensory sensitivities and sensory processing challenges in individuals with autism. It involves structured sensory experiences to help individuals adapt to sensory stimuli. Animal-Assisted Therapy: In this type of therapy, interactions with animals, such as therapy dogs or horses, are used to improve emotional regulation, social skills, and motivation in individuals with autism. Nutritional and Dietary Interventions: Some families explore dietary changes, such as gluten-free or casein-free diets, to address certain behavioral or gastrointestinal issues that may be associated with autism. Its essential to consult with a healthcare provider or nutritionist before making significant dietary changes. Alternative and Complementary Therapies: Some families explore alternative and complementary therapies like acupuncture, chiropractic care, or homeopathy. While these approaches may provide some individuals with autism with relief from certain symptoms, they should be approached with caution and under the guidance of qualified professionals. When considering alternative therapies or interventions, its crucial to: Consult with healthcare professionals or specialists who are knowledgeable about autism. Gather information and research the specific therapy or intervention to understand its evidence base and potential benefits and risks. Consider the individuals unique needs and preferences. Be cautious of therapies or interventions that make extravagant claims or promise "cures" for autism, as there is no known cure for autism. Ultimately, the choice of therapies and interventions should be based on the best interests of the individual with autism and guided by a healthcare teams recommendations. Collaborative decision-making involving parents, caregivers, therapists, and healthcare providers is essential in determining the most appropriate approaches to support the individuals development and well-being.');
    } else if (option === 'How can speech therapy benefit children with autism?') {
      // Display the specific message for this subquestion
      setSelectedSubOption('Speech therapy, also known as speech-language therapy, can benefit children with autism in several ways: Improving Communication Skills: Speech therapists work on developing functional communication, including speech, language, and social communication. They help children express their needs and wants effectively. Enhancing Articulation: Speech therapy can address articulation difficulties, helping children improve their speech clarity. Teaching Social Communication: Therapists help children with autism learn and use social communication skills, such as making eye contact, taking turns in conversations, and understanding non-verbal cues. Expanding Vocabulary: Speech therapy can build a childs vocabulary and help them understand and use words more effectively. Addressing Pragmatic Language: Pragmatic language skills, like understanding humor or sarcasm, are an essential part of social communication. Speech therapists work on these skills. Promoting Alternative Communication Methods: Some children with autism may benefit from alternative communication systems, such as picture exchange systems or speech-generating devices, which speech therapists can introduce and support.');
    } else if (option === 'What strategies can help with communication and social interactions?') {
      // Display the specific message for this subquestion
      setSelectedSubOption('Strategies to support communication and social interactions in individuals with autism may include: Visual Supports: Visual schedules, social stories, and visual cues can help individuals with autism understand and navigate social situations. Structured Social Skills Training: Programs that teach specific social skills through structured and systematic approaches. Use of Visual Aids: Visual aids, like PECS (Picture Exchange Communication System), can facilitate communication. Social Narratives: Creating narratives or stories that explain social expectations and interactions. Modeling and Role-Playing: Adults or peers modeling appropriate social behaviors, followed by role-playing. Visual Schedules: Creating visual schedules or routines to help individuals anticipate and understand daily activities. Sensory Support: Addressing sensory sensitivities or sensory regulation challenges that may affect social interactions. Peer-Mediated Interventions: Encouraging peers to support and include individuals with autism in social activities. Social Groups: Participation in social skills groups or therapeutic playgroups. Parent and Caregiver Training: Providing parents and caregivers with strategies to support social communication at home.');
    } else if (option === 'Are there support groups for families affected by autism?') {
      // Display the specific message for this subquestion
      setSelectedSubOption('Yes, there are several support groups and organizations in the United Kingdom that provide assistance and resources for families affected by autism. These groups offer valuable support, information, and a sense of community for individuals with autism and their families. Here are some prominent autism support organizations in the UK: National Autistic Society (NAS): NAS is one of the largest autism charities in the UK. They offer a wide range of services, including support groups, helplines, and resources for individuals with autism and their families. You can find local branches and support groups through their website. Website: National Autistic Society (NAS) Autism Alliance UK: Autism Alliance is a network of charities and organizations working together to provide support to individuals with autism and their families. They offer a variety of resources and services, including information about local support groups. Website: Autism Alliance UK Autism Network Scotland: While primarily focused on Scotland, this organization provides information, resources, and support services for individuals with autism and their families. They may have information on local support groups in Scotland. Website: Autism Network Scotland Autism West Midlands: This charity organization offers support and services to individuals with autism and their families in the West Midlands region of England. They have information on local support groups and events. Website: Autism West Midlands Ambitious about Autism: Ambitious about Autism focuses on children and young people with autism and provides support for their families. While they primarily offer services related to education, they may have information on local support in the Greater London area. Website: Ambitious about Autism Local Authorities and Councils: Many local authorities and councils in the UK also offer information and support for families affected by autism. Check the website of your local council or contact them directly to inquire about local services and support groups. Online Communities: In addition to physical support groups, there are numerous online communities and forums where parents and caregivers of individuals with autism can connect, share experiences, and seek advice. Websites like the NAS online community and Facebook groups dedicated to autism support can be valuable resources. Please note that the availability of support groups and services may vary by location. Its a good idea to reach out to these organizations directly or visit their websites for the most up-to-date information on local support groups and resources in your specific area within the UK.');
    } else if (option === 'What resources are available for educational support?') {
      // Display the specific message for this subquestion
      setSelectedSubOption('Educational support for children with autism can include special education services, Individualized Education Plans (IEPs), and a range of educational strategies and tools: Special Education Services: Children with autism may receive specialized instruction and support through special education programs in public schools. Individualized Education Plan (IEP): An IEP is a tailored plan created for each child with autism, outlining their educational goals, services, and accommodations. Applied Behavior Analysis (ABA): ABA therapy is an evidence-based intervention often used in educational settings to address behavioral and communication challenges. Speech Therapy and Occupational Therapy: Many schools offer speech and occupational therapy services to address speech, language, and sensory needs. Inclusion Programs: Some children with autism benefit from inclusive classroom settings that provide opportunities to learn alongside neurotypical peers. Educational Technology: Various educational apps and software can support learning and communication. Resource Centers: Look for local autism resource centers or organizations that provide guidance, workshops, and information on educational resources.');
    } else if (option === 'How can I create an autism-friendly environment at home or in the community?') {
      // Display the specific message for this subquestion
      setSelectedSubOption('Creating an autism-friendly environment involves making spaces and interactions more accessible and comfortable for individuals with autism. Here are some tips: Sensory Considerations: Be mindful of sensory sensitivities. Provide sensory-friendly spaces with options for sensory regulation, like quiet areas or sensory-friendly toys. Visual Supports: Use visual schedules, cues, or social stories to help individuals with autism understand routines and expectations. Clear Communication: Use clear and concise language. Give individuals with autism time to process information and respond. Predictability: Establish routines and predictability in daily life. Changes or transitions should be communicated in advance.Inclusivity: Promote inclusion and understanding in the community. Encourage peers to be supportive and accepting. Accessibility: Ensure physical spaces are accessible and accommodate sensory needs, such as offering noise-canceling headphones or visual supports in public places. Education: Educate others about autism and how to interact respectfully and inclusively. Support Services: Access relevant support services and therapies that can enhance daily life and development. Remember that creating an autism-friendly environment may require individualized adjustments based on the specific needs and preferences of the person with autism. ');
    }
  };

  const handleBackClick = () => {
    const previousOption = previousOptions.pop(); // Get the previous option
    setSelectedOption(previousOption);
    setSelectedSubOption(null);
    setPreviousOptions([...previousOptions]); // Update the list of previous options
  };

  let content;
  if (selectedSubOption) {
    // Display messages for selected sub-options

    content = (
      <div style={{ border: '3px solid #ccc', padding: '10px', marginBottom: '10px' }}>
        <p style={{ color: 'blue' }}>
          {selectedOption}
        </p>
      </div>
    );
  } else if (selectedOption) {
    content = (
      <div style={{ border: '3px solid #ccc', padding: '10px', marginBottom: '10px' }}>
        <p style={{ color: 'blue' }}>
          {selectedOption}
        </p>
      </div>
    );
  } else {
    content = <p>Hello, How can I help you?</p>;
  }

  let subContent;
  if (selectedSubOption) {
    subContent = (
      <div style={{ border: '3px solid #ccc', padding: '10px', marginBottom: '10px' }}>
        <p style={{ color: 'green' }}>
          {selectedSubOption}
        </p>
      </div>
    );
  }

  let buttons;
  if (selectedSubOption) {
    buttons = null; // No further options when a sub-option is selected
  } else if (selectedOption) {
    let subQuestions;
    if (selectedOption === 'What are the common early signs of autism?') {
      subQuestions = [
        'At what age do early signs of autism typically appear?',
        'What social communication difficulties should I look out for?',
        'Are repetitive behaviors an early sign of autism?',
        'How do sensory sensitivities manifest in young children with autism?',
      ];
    } else if (selectedOption === 'How is autism diagnosed?') {
      subQuestions = [
        'What professionals are involved in the diagnosis of autism?',
        'What criteria are used for diagnosing autism?',
      ];
    } else if (selectedOption === 'What are the available treatments and therapies for individuals with autism?') {
      subQuestions = [
        'What is Applied Behavior Analysis (ABA) therapy?',
        'Are there alternative therapies to ABA?',
        'How can speech therapy benefit children with autism?',
      ];
    } else {
      subQuestions = [
        'What strategies can help with communication and social interactions?',
        'Are there support groups for families affected by autism?',
        'What resources are available for educational support?',
        'How can I create an autism-friendly environment at home or in the community?',
      ];
    }

    buttons = subQuestions.map((option) => (
      <button
        key={option}
        onClick={() => handleOptionClick(option)}
        type="button" // Add the 'type' attribute to the button
        style={{
          display: 'block',
          width: '100%',
          padding: '10px',
          margin: '5px 0',
          backgroundColor: '#C68B77',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        {option}
      </button>
    ));
  } else {
    const questions = [
      'What are the common early signs of autism?',
      'How is autism diagnosed?',
      'What are the available treatments and therapies for individuals with autism?',
      'How can I support a child or family member with autism?',
    ];

    buttons = questions.map((option) => (
      <button
        key={option}
        onClick={() => handleOptionClick(option)}
        type="button" // Add the 'type' attribute to the button
        style={{
          display: 'block',
          width: '100%',
          padding: '10px',
          margin: '5px 0',
          backgroundColor: '#C68B77',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        {option}
      </button>
    ));
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '300px',
        height: '500px',
        backgroundColor: '#f0f0f0',
        border: '7px solid #C68B77',
        borderRadius: '8px',
        padding: '10px',
        zIndex: 1000,
        overflow: 'auto',
      }}
    >
      <div style={{ position: 'relative' }}>
        {previousOptions.length > 0 && ( // Only show the back button if there are previous options
          <button
            onClick={handleBackClick}
            style={{
              position: 'absolute',
              top: 0,
              left: 0, // Position at the top left corner
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#034d32',
              fontSize: '20px',
            }}
            type="button"
          >
            {'<-'}
          </button>
        )}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#034d32',
            fontSize: '20px',
          }}
          type="button"
        >
          X
        </button>
      </div>
      <h2 style={{ margin: '10px 0', textAlign: 'center' }}>Chat</h2>
      <hr style={{ borderColor: '#034d32' }} />
      {content}
      {subContent}
      <div>{buttons}</div>
    </div>
  );
}

// Add prop validation for the 'onClose' prop
Chatbot.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default Chatbot;
