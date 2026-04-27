import csv
import json

def process_csv(filename):
    people = {}
    with open(filename, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            id_val = row['id']
            if not id_val:
                continue
            people[id_val] = {
                'id': id_val,
                'name': row['nama'],
                'gender': row['gender'],
                'gen': row['generasi'],
                'ayah': row['ayah_id'],
                'ibu': row['ibu_id'],
                'pasangan': row['pasangan_id'],
                'children': []
            }

    # Second pass: establish relationships
    roots = []
    
    # We want to group by couple
    processed_couples = set()
    
    def get_couple_key(id1, id2):
        return tuple(sorted([id1, id2])) if id1 and id2 else None

    # First, find children for each person (based on ayah/ibu)
    for p_id, p in people.items():
        ayah_id = p['ayah']
        ibu_id = p['ibu']
        if ayah_id and ayah_id in people:
            people[ayah_id]['children'].append(p_id)
        if ibu_id and ibu_id in people:
            people[ibu_id]['children'].append(p_id)

    def build_tree(p_id):
        p = people[p_id]
        pasangan_id = p['pasangan']
        
        couple_key = get_couple_key(p_id, pasangan_id)
        if couple_key and couple_key in processed_couples:
            return None
        if couple_key:
            processed_couples.add(couple_key)
            
        data = {}
        husband = None
        wife = None
        
        if p['gender'] == 'L':
            husband = p
            if pasangan_id and pasangan_id in people:
                wife = people[pasangan_id]
        else:
            wife = p
            if pasangan_id and pasangan_id in people:
                husband = people[pasangan_id]
        
        if husband:
            data['husband'] = {
                'name': husband['name'],
                'avatar': 'assets/male.svg',
                'birth': '-',
                'location': '-'
            }
        if wife:
            data['wife'] = {
                'name': wife['name'],
                'avatar': 'assets/female.svg',
                'birth': '-',
                'location': '-'
            }
            
        # Get unique children of this couple
        couple_children_ids = []
        if husband:
            couple_children_ids.extend(husband['children'])
        if wife:
            couple_children_ids.extend(wife['children'])
            
        # Deduplicate
        couple_children_ids = list(dict.fromkeys(couple_children_ids))
        
        children_nodes = []
        for child_id in couple_children_ids:
            child_node = build_tree(child_id)
            if child_node:
                children_nodes.append(child_node)
            elif child_id in people and not people[child_id]['pasangan']:
                # Single child
                c = people[child_id]
                role = 'husband' if c['gender'] == 'L' else 'wife'
                children_nodes.append({
                    role: {
                        'name': c['name'],
                        'avatar': f'assets/{"male" if c["gender"] == "L" else "female"}.svg',
                        'birth': '-',
                        'location': '-'
                    }
                })
        
        if children_nodes:
            data['children'] = children_nodes
            
        return data

    # Start from root (Yusuf Lubis ID 1)
    tree = build_tree('1')
    return tree

if __name__ == "__main__":
    tree_data = process_csv('family_tree_clean.csv')
    print(json.dumps(tree_data, indent=4))
