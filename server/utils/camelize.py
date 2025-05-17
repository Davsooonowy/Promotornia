import humps

def camelize(data):
    if isinstance(data, dict):
        return {humps.camelize(key): camelize(value) for key, value in data.items()}
    if isinstance(data, list):
        return [camelize(value) for value in data]
    return data